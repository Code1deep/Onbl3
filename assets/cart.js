// cart.js amélioré
// Gestion du panier global multi-pages + facture

// ---------------- CONFIG ----------------
const ONLINE_PAYMENT_AVAILABLE = true; // ⚠️ Mettre false si le paiement en ligne est indisponible

// ---------------- PANIER ----------------
function getCart() {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    return cart;
}

function saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
}

// ---------------- CLIENT ----------------
function getClientCode() {
    let code = localStorage.getItem("clientCode");
    if (!code) {
        code = "CLT-" + new Date().toISOString().slice(0,10).replace(/-/g,"") + "-" + Math.floor(Math.random()*10000);
        localStorage.setItem("clientCode", code);
    }
    return code;
}

// ---------------- PANIER ACTIONS ----------------
function addToCart(name, price, quantity = 1) {
    let cart = getCart();
    let item = cart.find(i => i.name === name);
    if (item) {
        item.quantity += quantity;
    } else {
        cart.push({ name, price, quantity });
    }
    saveCart(cart);
    alert(quantity + " x " + name + " ajouté au panier !");
    updateCartDisplay();
}

function removeFromCart(name) {
    let cart = getCart().filter(i => i.name !== name);
    saveCart(cart);
    updateCartDisplay();
}

function clearCart() {
    localStorage.removeItem("cart");
    updateCartDisplay();
}

// ---------------- AFFICHAGE PANIER ----------------
function updateCartDisplay() {
    let cart = getCart();
    let container = document.getElementById("cart-items");
    let totalEl = document.getElementById("cart-total");

    if (!container || !totalEl) return;

    container.innerHTML = "";
    let total = 0;

    cart.forEach(item => {
        let itemEl = document.createElement("li");
        itemEl.innerHTML = `${item.quantity} x ${item.name} - $${(item.price * item.quantity).toFixed(2)}
            <button onclick="removeFromCart('${item.name}')">❌</button>`;
        container.appendChild(itemEl);
        total += item.price * item.quantity;
    });

    totalEl.textContent = "$" + total.toFixed(2);
}

// ---------------- FACTURE ----------------
function generateInvoice() {
    let cart = getCart();
    let invoiceContainer = document.getElementById("invoice");
    if (!invoiceContainer) return;

    let clientCode = getClientCode();
    let orderRef = "CMD-" + Date.now();
    let date = new Date().toLocaleString();

    let total = 0;
    let html = `<h2>Facture</h2>
        <p><b>Code client :</b> ${clientCode}</p>
        <p><b>Commande :</b> ${orderRef}</p>
        <p><b>Date :</b> ${date}</p>
        <table border="1" cellspacing="0" cellpadding="5">
            <tr><th>Article</th><th>Quantité</th><th>Prix</th><th>Sous-total</th></tr>`;

    cart.forEach(item => {
        let sub = item.price * item.quantity;
        total += sub;
        html += `<tr>
            <td>${item.name}</td>
            <td>${item.quantity}</td>
            <td>$${item.price.toFixed(2)}</td>
            <td>$${sub.toFixed(2)}</td>
        </tr>`;
    });

    html += `</table>
        <h3>Total: $${total.toFixed(2)}</h3>`;

    if (ONLINE_PAYMENT_AVAILABLE) {
        html += `<button onclick="payOnline()">💳 Payer en ligne</button>`;
    } else {
        html += `<p style="color:red; font-weight:bold;">
            ⚠️ Paiement en ligne temporairement indisponible.<br>
            Merci de régler en magasin ou à la livraison (cash ou carte débit).
        </p>`;
    }

    html += `<button onclick="clearCart()">🗑️ Vider le panier</button>`;

    invoiceContainer.innerHTML = html;
}

// ---------------- STRIPE PLACEHOLDER ----------------
function payOnline() {
    alert("Redirection vers Stripe Checkout (intégration backend nécessaire)...");
    // Ici on fera la redirection vers le backend Flask/Node qui génère une session Stripe
}
