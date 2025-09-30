// ==================== CART LOGIC ====================

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

// ==================== UI UPDATE ====================

function updateCartUI() {
  const cart = loadCart();
  const cartItems = document.getElementById("cart-items");
  const subtotalEl = document.getElementById("subtotal");
  const deliveryEl = document.getElementById("delivery");
  const totalEl = document.getElementById("total");
  const countEl = document.getElementById("cart-count");

  if (!cartItems) return; // si on est pas sur facture.html

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

// ==================== STRIPE CHECKOUT ====================

// ⚠️ clé publique Stripe TEST
const STRIPE_PUBLIC_KEY = "pk_test_xxxxxxxxxxxxxxxxx";
let stripeAvailable = true; // admin modifie selon dispo

async function payOnline() {
  if (!stripeAvailable) {
    alert("Paiement en ligne indisponible. Merci de payer au magasin ou à la livraison.");
    return;
  }

  const stripe = Stripe(STRIPE_PUBLIC_KEY);
  const cart = loadCart();
  const delivery = parseFloat(document.getElementById("delivery").textContent) || 0;

  if (cart.length === 0) {
    alert("Votre panier est vide.");
    return;
  }

  const res = await fetch("/create-checkout-session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cart: cart, delivery_fee: delivery })
  });

  const data = await res.json();
  if (data.id) {
    stripe.redirectToCheckout({ sessionId: data.id });
  } else {
    alert("Erreur Stripe : " + data.error);
  }
}

// ==================== FACTURE OFFLINE ====================

function generateInvoice(clientCode) {
  const cart = loadCart();
  if (cart.length === 0) {
    alert("Votre panier est vide.");
    return;
  }

  const ref = "CMD-" + Math.floor(Math.random() * 100000);
  const date = new Date().toLocaleString();

  let invoiceHTML = `<h3>Facture</h3>
  <p><strong>Commande:</strong> ${ref}</p>
  <p><strong>Client:</strong> ${clientCode || "N/A"}</p>
  <p><strong>Date:</strong> ${date}</p>
  <ul>`;

  let total = 0;
  cart.forEach(i => {
    total += i.price * i.quantity;
    invoiceHTML += `<li>${i.name} x${i.quantity} = ${(i.price * i.quantity).toFixed(2)}$</li>`;
  });
  let delivery = total > 20 ? 0 : 5;
  invoiceHTML += `</ul>
  <p>Sous-total: ${total.toFixed(2)}$</p>
  <p>Livraison: ${delivery.toFixed(2)}$</p>
  <h4>Total: ${(total + delivery).toFixed(2)}$</h4>`;

  document.getElementById("cart-items").innerHTML = invoiceHTML;
}

// Init UI
document.addEventListener("DOMContentLoaded", updateCartUI);
