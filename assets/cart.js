// ==================== STOCK LOGIC ====================

// Charger stock depuis localStorage
function loadStock() {
  return JSON.parse(localStorage.getItem("stock")) || {};
}

// Sauvegarder stock
function saveStock(stock) {
  localStorage.setItem("stock", JSON.stringify(stock));
}

// Mettre à jour affichage du stock sur la page
function updateStockUI() {
  const stock = loadStock();
  for (let id in stock) {
    const el = document.getElementById(`stock-${id}`);
    if (el) {
      el.textContent = `Stock restant: ${stock[id]}`;
      el.style.color = stock[id] > 0 ? "green" : "red";
    }
  }
}

// ==================== CART LOGIC ====================

// Charger panier depuis localStorage
function loadCart() {
  return JSON.parse(localStorage.getItem("cart")) || [];
}

// Sauvegarder panier
function saveCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
}

// Ajouter un produit au panier
function addToCart(product) {
  let cart = loadCart();
  let stock = loadStock();

  // Vérifier stock
  if (!stock[product.id] || stock[product.id] < product.quantity) {
    alert("Stock insuffisant pour cet article.");
    return;
  }

  // Décrémente stock
  stock[product.id] -= product.quantity;

  // Ajouter ou incrémenter dans panier
  const existing = cart.find(p => p.id === product.id);
  if (existing) {
    existing.quantity += product.quantity;
  } else {
    cart.push(product);
  }

  saveCart(cart);
  saveStock(stock);
  updateCartUI();
  updateStockUI();
}

// Supprimer un article du panier
function removeItem(id) {
  let cart = loadCart();
  let stock = loadStock();

  const item = cart.find(p => p.id === id);
  if (item) {
    // Rendre stock
    stock[id] = (stock[id] || 0) + item.quantity;
  }

  // Retirer du panier
  cart = cart.filter(p => p.id !== id);

  saveCart(cart);
  saveStock(stock);
  updateCartUI();
  updateStockUI();
}

// Vider le panier
function clearCart() {
  let cart = loadCart();
  let stock = loadStock();

  // Rendre tous les stocks
  cart.forEach(item => {
    stock[item.id] = (stock[item.id] || 0) + item.quantity;
  });

  localStorage.removeItem("cart");
  saveStock(stock);

  updateCartUI();
  updateStockUI();
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
      <p>
        ${item.name} x${item.quantity} = ${(item.price * item.quantity).toFixed(2)}$
        <button class="btn btn-sm btn-danger" onclick="removeItem(${item.id})">❌</button>
      </p>`;
  });

  const delivery = subtotal > 20 ? 0 : 5;
  if (document.getElementById("free-shipping-msg")) {
    document.getElementById("free-shipping-msg").style.display = subtotal > 20 ? "block" : "none";
  }

  if (subtotalEl) subtotalEl.textContent = subtotal.toFixed(2);
  if (deliveryEl) deliveryEl.textContent = delivery.toFixed(2);
  if (totalEl) totalEl.textContent = (subtotal + delivery).toFixed(2);
  if (countEl) countEl.textContent = cart.reduce((s, i) => s + i.quantity, 0);
}

// ==================== FACTURE OFFLINE ====================

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
      <h4>Facture Hors Ligne</h4>
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
  invoiceHTML += `</ul>
      <p><strong>Sous-total:</strong> ${total.toFixed(2)}$</p>
      <p><strong>Livraison:</strong> ${delivery.toFixed(2)}$</p>
      <h5>Total: ${(total + delivery).toFixed(2)}$</h5>
      <p class="text-warning">Paiement à effectuer au magasin ou à la livraison</p>
    </div>`;

  document.getElementById("cart-items").innerHTML = invoiceHTML;
}

// ==================== INIT ====================

document.addEventListener("DOMContentLoaded", () => {
  updateCartUI();
  updateStockUI();
});
