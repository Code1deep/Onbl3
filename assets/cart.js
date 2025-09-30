// ================= CART LOGIC =================

// Charger panier depuis localStorage
function loadCart() {
  return JSON.parse(localStorage.getItem("cart")) || [];
}

// Sauvegarder panier
function saveCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
}

// Ajouter un produit
function addToCart(product) {
  let cart = loadCart();
  const existing = cart.find(p => p.id === product.id);

  if (existing) {
    existing.quantity += product.quantity;
  } else {
    cart.push(product);
  }

  saveCart(cart);
  updateCartUI();
}

// Supprimer un article
function removeItem(id) {
  let cart = loadCart().filter(p => p.id !== id);
  saveCart(cart);
  updateCartUI();
}

// Vider le panier
function clearCart() {
  localStorage.removeItem("cart");
  updateCartUI();
}

// ================= UI UPDATE =================
function updateCartUI() {
  const cart = loadCart();
  const cartItems = document.getElementById("cart-items");
  const subtotalEl = document.getElementById("subtotal");
  const deliveryEl = document.getElementById("delivery");
  const totalEl = document.getElementById("total");
  const countEl = document.getElementById("cart-count");

  if (!cartItems) return; // UI non présente sur toutes les pages

  cartItems.innerHTML = "";
  let subtotal = 0;

  cart.forEach(item => {
    subtotal += item.price * item.quantity;
    cartItems.innerHTML += `
      <p>${item.name} x${item.quantity} = ${(item.price * item.quantity).toFixed(2)}$
      <button onclick="removeItem(${item.id})">❌</button></p>`;
  });

  const delivery = subtotal > 20 ? 0 : 5;

  if (subtotalEl) subtotalEl.textContent = subtotal.toFixed(2);
  if (deliveryEl) deliveryEl.textContent = delivery.toFixed(2);
  if (totalEl) totalEl.textContent = (subtotal + delivery).toFixed(2);
  if (countEl) countEl.textContent = cart.reduce((s, i) => s + i.quantity, 0);
}

document.addEventListener("DOMContentLoaded", updateCartUI);
