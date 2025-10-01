// -------------------- CONFIG --------------------
const ADMIN_PASSWORD = "admin123"; // mot de passe admin
let onlinePaymentEnabled = false;  // état du paiement en ligne

let cart = [];
let stock = {}; // stock restant par article
let orderId = Math.floor(Math.random() * 1000000); // numéro commande unique

// -------------------- PANIER --------------------
function addToCart(itemName, itemPrice, itemQuantity) {
    if (!stock[itemName]) stock[itemName] = 10; // stock par défaut = 10

    if (stock[itemName] <= 0) {
        alert("Stock épuisé pour " + itemName);
        return;
    }

    let item = cart.find(i => i.name === itemName);
    if (item) {
        item.quantity++;
    } else {
        cart.push({ name: itemName, price: itemPrice, quantity: 1 });
    }

    stock[itemName]--; // retirer du stock
    updateCart();
}

function removeFromCart(itemName) {
    let item = cart.find(i => i.name === itemName);
    if (item) {
        item.quantity--;
        stock[itemName]++; // remettre dans le stock

        if (item.quantity <= 0) {
            cart = cart.filter(i => i.name !== itemName);
        }
    }
    updateCart();
}

function updateCart() {
    let cartDiv = document.getElementById("cart");
    if (!cartDiv) return;

    cartDiv.innerHTML = "";
    let total = 0;

    cart.forEach(item => {
        total += item.price * item.quantity;
        cartDiv.innerHTML += `
            ${item.name} - ${item.price} $ x ${item.quantity} 
            (Stock restant: ${stock[item.name]}) 
            <button onclick="removeFromCart('${item.name}')">❌</button><br>
        `;
    });

    cartDiv.innerHTML += `<hr>Total: ${total.toFixed(2)} $`;
}

// -------------------- FACTURE --------------------
function showInvoice() {
    if (cart.length === 0) {
        alert("Votre panier est vide !");
        return;
    }

    let invoiceDiv = document.getElementById("invoice");
    if (!invoiceDiv) return;

    let invoiceHTML = `
        <h2>🧾 Facture</h2>
        <p>Commande #${orderId}</p>
        <table border="1" width="100%">
            <tr><th>Article</th><th>Prix</th><th>Quantité</th><th>Sous-total</th></tr>
    `;

    let total = 0;
    cart.forEach(item => {
        let subTotal = item.price * item.quantity;
        total += subTotal;
        invoiceHTML += `<tr>
            <td>${item.name}</td>
            <td>${item.price} $</td>
            <td>${item.quantity}</td>
            <td>${subTotal.toFixed(2)} $</td>
        </tr>`;
    });

    invoiceHTML += `</table>
        <h3>Total: ${total.toFixed(2)} $</h3>
        <div id="payment-options"></div>
        <button onclick="downloadInvoice()">⬇ Télécharger PDF</button>
        <button onclick="closeInvoice()">❌ Fermer / Retour magasin</button>
    `;

    invoiceDiv.innerHTML = invoiceHTML;
    updatePaymentOptions(); // afficher options paiement
}

// -------------------- TELECHARGER PDF --------------------
function downloadInvoice() {
    const invoice = document.getElementById("invoice").innerHTML;
    const win = window.open("", "", "height=700,width=900");
    win.document.write("<html><head><title>Facture</title></head><body>");
    win.document.write(invoice);
    win.document.write("</body></html>");
    win.document.close();
    win.print();
}

// -------------------- FERMER FACTURE --------------------
function closeInvoice() {
    document.getElementById("invoice").innerHTML = "";
    cart = [];
    orderId = Math.floor(Math.random() * 1000000); // nouveau numéro commande
    updateCart();
}

// -------------------- ADMIN : ACTIVER/DESACTIVER PAIEMENT --------------------
function toggleOnlinePayment() {
    const pwd = prompt("🔑 Entrez le mot de passe administrateur :");
    
    if (pwd === ADMIN_PASSWORD) {
        onlinePaymentEnabled = !onlinePaymentEnabled;
        alert("Mode paiement en ligne " + (onlinePaymentEnabled ? "activé ✅" : "désactivé ❌"));
        updatePaymentOptions();
    } else {
        alert("Mot de passe incorrect ❌");
    }
}

function updatePaymentOptions() {
    const paymentOptionsDiv = document.getElementById("payment-options");
    if (!paymentOptionsDiv) return;

    let options = `
        <label><input type="radio" name="payment" value="store" checked> Payer en magasin 🏬</label><br>
        <label><input type="radio" name="payment" value="delivery"> Paiement à la livraison 🚚</label><br>
    `;

    if (onlinePaymentEnabled) {
        options += `<label><input type="radio" name="payment" value="online"> Paiement en ligne 💳</label>`;
    }

    paymentOptionsDiv.innerHTML = options;
}
