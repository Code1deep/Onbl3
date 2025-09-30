/* ==========================================================
   cart.js - Gestion du panier et génération des factures
   Multilangue : Français (facture.html) et Anglais (invoice_en.html)
   ========================================================== */

// Clés pour LocalStorage
const STORAGE_KEY = "cart";

// Langue (détectée selon la page HTML)
let lang = document.documentElement.lang === "en" ? "en" : "fr";

// Textes multilingues
const i18n = {
    fr: {
        title: "Facture - Votre commande",
        clientCode: "Code client",
        orderRef: "Référence commande",
        orderDate: "Date",
        items: "Articles",
        qty: "Qté",
        price: "Prix",
        total: "Total",
        subtotal: "Sous-total",
        shipping: "Livraison",
        freeShipping: "Livraison gratuite !",
        payOnline: "💳 Payer en ligne",
        clearCart: "🗑️ Vider le panier",
        phone: "📞 Compléter la commande par téléphone",
        phoneMsg: "Veuillez confirmer en appelant le 514 123 4567. Merci !",
        empty: "Votre panier est vide."
    },
    en: {
        title: "Invoice - Your Order",
        clientCode: "Client Code",
        orderRef: "Order Reference",
        orderDate: "Date",
        items: "Items",
        qty: "Qty",
        price: "Price",
        total: "Total",
        subtotal: "Subtotal",
        shipping: "Shipping",
        freeShipping: "Free delivery!",
        payOnline: "💳 Pay Online",
        clearCart: "🗑️ Clear Cart",
        phone: "📞 Complete order by phone",
        phoneMsg: "Please confirm by calling 514 123 4567. Thank you!",
        empty: "Your cart is empty."
    }
};

// Génération ID commande
function generateOrderRef() {
    return "CMD-" + Date.now().toString().slice(-6);
}

// Charger le panier depuis LocalStorage
function getCart() {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
}

// Sauvegarder le panier
function saveCart(cart) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
}

// Vider le panier
function clearCart() {
    if (confirm(lang === "fr" ? "Voulez-vous vider le panier ?" : "Clear the cart?")) {
        localStorage.removeItem(STORAGE_KEY);
        generateInvoice();
    }
}

// Générer facture
function generateInvoice() {
    const cart = getCart();
    const invoice = document.getElementById("invoice");

    if (!cart.length) {
        invoice.innerHTML = `<p>${i18n[lang].empty}</p>`;
        return;
    }

    const clientCode = localStorage.getItem("clientCode") || "N/A";
    const orderRef = localStorage.getItem("orderRef") || generateOrderRef();
    localStorage.setItem("orderRef", orderRef);
    const date = new Date().toLocaleDateString();

    let subtotal = 0;
    let rows = "";
    cart.forEach(item => {
        const lineTotal = item.price * item.qty;
        subtotal += lineTotal;
        rows += `
            <tr>
                <td>${item.name}</td>
                <td>${item.qty}</td>
                <td>${item.price.toFixed(2)} $</td>
                <td>${lineTotal.toFixed(2)} $</td>
            </tr>`;
    });

    const shipping = subtotal > 20 ? 0 : 5;
    const total = subtotal + shipping;

    invoice.innerHTML = `
        <h2>${i18n[lang].title}</h2>
        <p><strong>${i18n[lang].clientCode}:</strong> ${clientCode}</p>
        <p><strong>${i18n[lang].orderRef}:</strong> ${orderRef}</p>
        <p><strong>${i18n[lang].orderDate}:</strong> ${date}</p>

        <table>
            <thead>
                <tr>
                    <th>${i18n[lang].items}</th>
                    <th>${i18n[lang].qty}</th>
                    <th>${i18n[lang].price}</th>
                    <th>${i18n[lang].total}</th>
                </tr>
            </thead>
            <tbody>
                ${rows}
            </tbody>
        </table>

        <p><strong>${i18n[lang].subtotal}:</strong> ${subtotal.toFixed(2)} $</p>
        <p><strong>${i18n[lang].shipping}:</strong> ${shipping.toFixed(2)} $</p>
        <p><strong>${i18n[lang].total}:</strong> ${total.toFixed(2)} $</p>
        <p style="color:green">${shipping === 0 ? i18n[lang].freeShipping : ""}</p>

        <div class="actions">
            <button class="pay-btn">${i18n[lang].payOnline}</button>
            <button class="clear-btn" onclick="clearCart()">${i18n[lang].clearCart}</button>
            <button class="phone-btn" onclick="alert('${i18n[lang].phoneMsg}')">${i18n[lang].phone}</button>
        </div>
    `;
}
