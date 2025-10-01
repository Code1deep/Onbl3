// ==================== CART LOGIC ====================

// Charger panier depuis localStorage
function loadCart() {
  return JSON.parse(localStorage.getItem("cart")) || [];
}

// Sauvegarder panier
function saveCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
}

// Charger stock depuis localStorage
function loadStock() {
  return JSON.parse(localStorage.getItem("stock")) || {};
}

// Sauvegarder stock
function saveStock(stock) {
  localStorage.setItem("stock", JSON.stringify(stock));
}

// Ajouter un produit
function addToCart(product) {
  let cart = loadCart();
  let stock = loadStock();

  // Initialiser stock si pas défini
  if (stock[product.id] === undefined) {
    stock[product.id] = product.stock || 10; // stock par défaut
  }

  if (stock[product.id] <= 0) {
    alert("Stock épuisé pour " + product.name);
    return;
  }

  const existing = cart.find(p => p.id === product.id);
  if (existing) {
    if (stock[product.id] - product.quantity >= 0) {
      existing.quantity += product.quantity;
      stock[product.id] -= product.quantity;
    } else {
      alert("Pas assez de stock disponible.");
    }
  } else {
    if (stock[product.id] - product.quantity >= 0) {
      cart.push(product);
      stock[product.id] -= product.quantity;
    } else {
      alert("Pas assez de stock disponible.");
    }
  }

  saveCart(cart);
  saveStock(stock);
  updateCartUI();
}

// Supprimer un article
function removeItem(id) {
  let cart = loadCart();
  let stock = loadStock();
  const item = cart.find(p => p.id === id);

  if (item) {
    stock[id] = (stock[id] || 0) + item.quantity; // remettre au stock
  }

  cart = cart.filter(p => p.id !== id);
  saveCart(cart);
  saveStock(stock);
  updateCartUI();
}

// Vider le panier
function clearCart() {
  let cart = loadCart();
  let stock = loadStock();

  cart.forEach(item => {
    stock[item.id] = (stock[item.id] || 0) + item.quantity; // tout remettre au stock
  });

  localStorage.removeItem("cart");
  saveStock(stock);
  updateCartUI();
}

// ==================== UI UPDATE ====================

function updateCartUI() {
  const cart = loadCart();
  const cartItems = document.getElementById("cart-items");
  const subtotalEl = document.getElementById("subtotal");
  const deliveryEl = document.getElementById("delivery");
  const totalEl = document.getElementById("total");
  const countEl = document.getElementById("cart-count");

  if (!cartItems) return;

  cartItems.innerHTML = "";
  let subtotal = 0;

  cart.forEach(item => {
    subtotal += item.price * item.quantity;
    cartItems.innerHTML += `
      <p>${item.name} x${item.quantity} = ${(item.price * item.quantity).toFixed(2)}$
      <button class="btn btn-sm btn-danger" onclick="removeItem(${item.id})">❌</button></p>`;
  });

  const delivery = subtotal > 20 ? 0 : 5;
  if (subtotal > 20) {
    document.getElementById("free-shipping-msg").style.display = "block";
  } else {
    document.getElementById("free-shipping-msg").style.display = "none";
  }

  subtotalEl.textContent = subtotal.toFixed(2);
  deliveryEl.textContent = delivery.toFixed(2);
  totalEl.textContent = (subtotal + delivery).toFixed(2);
  if (countEl) countEl.textContent = cart.reduce((s, i) => s + i.quantity, 0);
}

// ==================== FACTURE ====================

function generateInvoice() {
  const cart = loadCart();
  if (cart.length === 0) {
    alert("Votre panier est vide.");
    return;
  }

  const ref = "CMD-" + Math.floor(Math.random() * 100000);
  const date = new Date().toLocaleString();
  const clientCode = localStorage.getItem("clientCode") || "N/A";

  let invoiceHTML = `
    <div class="alert alert-info">
      <h4>Facture</h4>
      <p><strong>Commande:</strong> ${ref}</p>
      <p><strong>Client:</strong> ${clientCode}</p>
      <p><strong>Date:</strong> ${date}</p>
      <hr>
      <h5>Articles:</h5>
      <ul class="list-unstyled">
  `;

  let total = 0;
  cart.forEach(i => {
    total += i.price * i.quantity;
    invoiceHTML += `<li>${i.name} x${i.quantity} = ${(i.price * i.quantity).toFixed(2)}$</li>`;
  });

  let delivery = total > 20 ? 0 : 5;
  let grandTotal = (total + delivery).toFixed(2);

  invoiceHTML += `</ul>
      <p><strong>Sous-total:</strong> ${total.toFixed(2)}$</p>
      <p><strong>Livraison:</strong> ${delivery.toFixed(2)}$</p>
      <h5>Total: ${grandTotal}$</h5>
      
      <label><strong>Mode de paiement:</strong></label>
      <select id="payment-method" class="form-control mb-2">
        <option value="offline">Paiement à la livraison</option>
        <option value="online">Paiement en ligne</option>
      </select>
      
      <button class="btn btn-success" onclick="downloadInvoice('${ref}')">Télécharger PDF</button>
      <button class="btn btn-secondary" onclick="returnToShop()">Retour au magasin</button>
    </div>`;

  document.getElementById("cart-items").innerHTML = invoiceHTML;
}

// Télécharger la facture en PDF
function downloadInvoice(ref) {
  const content = document.getElementById("cart-items").innerHTML;
  const blob = new Blob([content], { type: "application/pdf" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = ref + ".pdf";
  link.click();
}

// Retour au magasin
function returnToShop() {
  window.location.href = "shop.html"; // adapte le nom du fichier
}

// Init UI
document.addEventListener("DOMContentLoaded", updateCartUI);
