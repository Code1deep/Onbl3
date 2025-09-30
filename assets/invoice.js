// invoice.js - Gestion des factures et PDF
class InvoiceManager {
  constructor() {
    this.cartManager = cartManager;
  }

  // Générer une facture détaillée
  generateDetailedInvoice() {
    const clientCode = this.cartManager.getClientCode();
    const cart = clientCode ? this.cartManager.loadCart(clientCode) : [];
    
    if (cart.length === 0) {
      alert("Votre panier est vide.");
      return null;
    }

    const orderNumber = 'CMD-' + Math.floor(Math.random() * 100000);
    const orderDate = new Date().toLocaleString('fr-FR');
    const paymentMethod = this.getPaymentMethod();

    let invoiceHTML = `
      <div class="invoice-details mb-3 p-3 border rounded">
        <h4>📋 Facture Détaillée</h4>
        <p><strong>N° Commande:</strong> ${orderNumber}</p>
        <p><strong>Code Client:</strong> ${clientCode}</p>
        <p><strong>Date:</strong> ${orderDate}</p>
        <p><strong>Mode de paiement:</strong> ${this.getPaymentMethodText(paymentMethod)}</p>
        
        <table class="table table-sm mt-3">
          <thead class="table-light">
            <tr>
              <th>Article</th>
              <th>Qté</th>
              <th>Prix unitaire</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
    `;
    
    let subtotal = 0;
    cart.forEach(item => {
      const itemTotal = item.price * item.quantity;
      subtotal += itemTotal;
      invoiceHTML += `
        <tr>
          <td>${item.name}</td>
          <td>${item.quantity}</td>
          <td>${item.price.toFixed(2)} $</td>
          <td>${itemTotal.toFixed(2)} $</td>
        </tr>`;
    });
    
    const shipping = subtotal > 20 ? 0 : 5;
    const total = subtotal + shipping;
    
    invoiceHTML += `</tbody>
      <tfoot>
        <tr><td colspan="3">Sous-total</td><td>${subtotal.toFixed(2)} $</td></tr>
        <tr><td colspan="3">Livraison</td><td>${shipping.toFixed(2)} $</td></tr>
        <tr><td colspan="3"><strong>Total</strong></td><td><strong>${total.toFixed(2)} $</strong></td></tr>
      </tfoot>
    </table>`;
    
    // Ajout du bouton de téléchargement
    invoiceHTML += `
      <button class="btn btn-success w-100 mt-3" 
              onclick="invoiceManager.downloadPDF('${clientCode}', '${orderNumber}')">
        <i class="fa fa-download"></i> Télécharger la facture PDF
      </button>
    </div>`;

    return {
      html: invoiceHTML,
      orderNumber,
      orderDate,
      clientCode,
      subtotal,
      shipping,
      total,
      paymentMethod,
      cart
    };
  }

  // Obtenir la méthode de paiement
  getPaymentMethod() {
    const select = document.getElementById('payment-method');
    return select ? select.value : 'magasin';
  }

  // Texte de la méthode de paiement
  getPaymentMethodText(method) {
    const methods = {
      'magasin': 'Au magasin',
      'livraison': 'À la livraison',
      'enligne': 'En ligne'
    };
    return methods[method] || 'Au magasin';
  }

  // Télécharger en PDF
  downloadPDF(clientCode, orderNumber) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    const cart = this.cartManager.loadCart(clientCode);
    const paymentMethod = this.getPaymentMethod();
    
    // En-tête
    doc.setFontSize(18);
    doc.text('FACTURE', 105, 15, { align: 'center' });
    
    doc.setFontSize(10);
    doc.text(`N° Commande: ${orderNumber}`, 20, 25);
    doc.text(`Client: ${clientCode}`, 20, 32);
    doc.text(`Date: ${new Date().toLocaleString('fr-FR')}`, 20, 39);
    doc.text(`Paiement: ${this.getPaymentMethodText(paymentMethod)}`, 20, 46);
    
    // En-tête du tableau
    doc.setFillColor(200, 200, 200);
    doc.rect(20, 55, 170, 8, 'F');
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);
    doc.text('Article', 22, 60);
    doc.text('Qté', 100, 60);
    doc.text('Prix', 130, 60);
    doc.text('Total', 160, 60);
    
    // Articles
    let yPosition = 68;
    let subtotal = 0;
    
    cart.forEach(item => {
      const itemTotal = item.price * item.quantity;
      subtotal += itemTotal;
      
      doc.text(item.name, 22, yPosition);
      doc.text(item.quantity.toString(), 100, yPosition);
      doc.text(`${item.price.toFixed(2)} $`, 130, yPosition);
      doc.text(`${itemTotal.toFixed(2)} $`, 160, yPosition);
      
      yPosition += 7;
    });
    
    // Total
    const shipping = subtotal > 20 ? 0 : 5;
    const total = subtotal + shipping;
    
    yPosition += 10;
    doc.text(`Sous-total: ${subtotal.toFixed(2)} $`, 130, yPosition);
    doc.text(`Livraison: ${shipping.toFixed(2)} $`, 130, yPosition + 7);
    doc.setFont(undefined, 'bold');
    doc.text(`TOTAL: ${total.toFixed(2)} $`, 130, yPosition + 14);
    
    // Sauvegarder le PDF
    doc.save(`facture-${orderNumber}.pdf`);
  }

  // Afficher la facture détaillée
  displayDetailedInvoice() {
    const invoice = this.generateDetailedInvoice();
    if (invoice) {
      const cartItems = document.getElementById('cart-items');
      if (cartItems) {
        cartItems.innerHTML = invoice.html;
      }
    }
  }

  // Procéder au paiement
  proceedPayment() {
    const clientCode = this.cartManager.getClientCode();
    const cart = clientCode ? this.cartManager.loadCart(clientCode) : [];
    
    if (cart.length === 0) {
      alert("Votre panier est vide.");
      return;
    }

    if (!window.stripeAvailable) {
      // Paiement hors ligne
      this.displayDetailedInvoice();
      alert("Paiement en ligne indisponible. Vous pouvez payer en magasin ou à la livraison.");
    } else {
      // Paiement Stripe (simulation)
      alert("Redirection vers le paiement sécurisé...");
      // Ici vous intégreriez l'API Stripe
    }
  }
}

// Initialisation du gestionnaire de factures
const invoiceManager = new InvoiceManager();

// Fonctions globales pour HTML
function proceedPayment() {
  invoiceManager.proceedPayment();
}

function viewDetailedInvoice() {
  invoiceManager.displayDetailedInvoice();
}

// Pour la page facture.html
function initInvoicePage() {
  if (document.getElementById('facture-table')) {
    invoiceManager.generateDetailedInvoice();
  }
}

document.addEventListener('DOMContentLoaded', initInvoicePage);
