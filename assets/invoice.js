// ================= INVOICE LOGIC =================

// Générer facture HTML
function generateInvoice() {
  const cart = loadCart();
  if (cart.length === 0) {
    alert("Votre panier est vide !");
    return;
  }

  const orderId = "CMD-" + Date.now();
  const today = new Date().toLocaleDateString("fr-CA", {
    year: 'numeric', month: 'long', day: 'numeric'
  });

  document.getElementById("order-id").textContent = orderId;
  document.getElementById("order-date").textContent = today;

  const tbody = document.querySelector("#facture-table tbody");
  tbody.innerHTML = "";

  let total = 0;
  cart.forEach(item => {
    const row = document.createElement("tr");
    const itemTotal = (item.quantity * item.price).toFixed(2);
    row.innerHTML = `
      <td>${item.name}</td>
      <td>${item.quantity}</td>
      <td>${item.price.toFixed(2)} $</td>
      <td>${itemTotal} $</td>
    `;
    tbody.appendChild(row);
    total += parseFloat(itemTotal);
  });

  document.getElementById("facture-total").textContent = total.toFixed(2);

  return { orderId, today, total, cart };
}

// Génération PDF
function downloadPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const invoice = generateInvoice();

  if (!invoice) return;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("Facture - Onbl3 Multiservices", 20, 20);

  doc.setFontSize(12);
  doc.text(`Numéro de commande : ${invoice.orderId}`, 20, 35);
  doc.text(`Date : ${invoice.today}`, 20, 45);

  // Tableau articles
  doc.autoTable({
    startY: 60,
    head: [["Article", "Quantité", "Prix unitaire", "Total"]],
    body: invoice.cart.map(item => [
      item.name,
      item.quantity,
      item.price.toFixed(2) + " $",
      (item.quantity * item.price).toFixed(2) + " $"
    ]),
  });

  // Total
  doc.text(`Total : ${invoice.total.toFixed(2)} $`, 150, doc.lastAutoTable.finalY + 15);

  // Instructions paiement
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text("Instructions de paiement :", 20, doc.lastAutoTable.finalY + 35);
  doc.text("- Paiement en ligne (Visa, Mastercard, Débit).", 25, doc.lastAutoTable.finalY + 45);
  doc.text("- Confirmation au 514 123 4567 si pas de paiement en ligne.", 25, doc.lastAutoTable.finalY + 55);
  doc.text("- Livraison gratuite > 20$.", 25, doc.lastAutoTable.finalY + 65);

  doc.save(`facture_${invoice.orderId}.pdf`);
}

document.addEventListener("DOMContentLoaded", generateInvoice);
