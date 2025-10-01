// cart.js
// Central cart + stock + invoice logic (full front-end, localStorage-based)

// ---------- Helpers ----------
function safeParse(json, fallback) {
  try { return JSON.parse(json); } catch(e) { return fallback; }
}

function getClientKey(code) {
  return `cart_${code}`;
}

// ---------- Stock management ----------
function loadStock() {
  return safeParse(localStorage.getItem('stock'), {});
}
function saveStock(stock) {
  localStorage.setItem('stock', JSON.stringify(stock));
}

// Initialize stock if empty (call with an object {id:qty,...})
function initStock(initial) {
  const s = loadStock();
  // only seed if completely empty
  if (Object.keys(s).length === 0 && initial && typeof initial === 'object') {
    saveStock(initial);
  }
  updateStockUI();
}

// Update any DOM elements with id="stock-<id>"
function updateStockUI() {
  const stock = loadStock();
  Object.keys(stock).forEach(id => {
    const el = document.getElementById(`stock-${id}`);
    if (el) {
      el.textContent = `Stock restant: ${stock[id]}`;
      el.style.color = stock[id] > 0 ? 'green' : 'red';
    }
  });
}

// ---------- Cart management (per clientCode) ----------
function loadCart(clientCode) {
  if (!clientCode) return [];
  return safeParse(localStorage.getItem(getClientKey(clientCode)), []);
}
function saveCart(clientCode, cart) {
  localStorage.setItem(getClientKey(clientCode), JSON.stringify(cart));
}

// Add to cart by product object: {id, name, price, quantity}
function addToCartObj(clientCode, product) {
  if (!clientCode) { alert("Veuillez entrer votre code client."); return; }
  if (!product || !product.id) return;

  const stock = loadStock();
  const available = stock[product.id] || 0;
  if (available < product.quantity) {
    alert(`Stock insuffisant (disponible: ${available}).`);
    return;
  }

  // Decrement stock
  stock[product.id] = available - product.quantity;
  saveStock(stock);

  // Save to cart
  const cart = loadCart(clientCode);
  const existing = cart.find(i => i.id === product.id);
  if (existing) {
    existing.quantity += product.quantity;
  } else {
    // keep a minimal object in cart: id,name,price,quantity
    cart.push({
      id: product.id,
      name: product.name,
      price: Number(product.price),
      quantity: Number(product.quantity)
    });
  }
  saveCart(clientCode, cart);

  updateCartUI(); // update any visible cart area
  updateStockUI();
}

// convenience wrapper if you only pass id and qty; page must provide products[] context
function addToCartById(clientCode, productsList, id, qty=1) {
  const p = (productsList || []).find(x => x.id === id);
  if (!p) { alert("Produit introuvable."); return; }
  addToCartObj(clientCode, { id: p.id, name: p.name, price: p.price, quantity: Number(qty) });
}

// Remove one product from cart entirely (and restore stock)
function removeItemFromCart(clientCode, id) {
  if (!clientCode) return;
  const cart = loadCart(clientCode);
  const idx = cart.findIndex(i => i.id === id);
  if (idx === -1) return;

  const item = cart[idx];
  // restore stock
  const stock = loadStock();
  stock[id] = (stock[id] || 0) + item.quantity;
  saveStock(stock);

  // remove
  cart.splice(idx, 1);
  saveCart(clientCode, cart);

  updateCartUI();
  updateStockUI();
}

// Clear cart and restore all stock
function clearCartForClient(clientCode) {
  if (!clientCode) return;
  const cart = loadCart(clientCode);
  if (!cart.length) return;
  const stock = loadStock();
  cart.forEach(i => { stock[i.id] = (stock[i.id] || 0) + i.quantity; });
  saveStock(stock);

  localStorage.removeItem(getClientKey(clientCode));
  updateCartUI();
  updateStockUI();
}

// ---------- UI updates (shared) ----------
function getVisibleClientCode() {
  // tries to find an input#clientCode on the page or fallback to 'default'
  const input = document.getElementById('clientCode');
  const stored = localStorage.getItem('clientCode_current');
  if (input && input.value.trim()) {
    // remember current client for cross-page navigation
    localStorage.setItem('clientCode_current', input.value.trim());
    return input.value.trim();
  }
  return stored || '';
}

// Update cart UI area (if present in current page)
// Expects elements: #cart-items, #subtotal, #delivery (or #shipping), #total, #cart-count
function updateCartUI() {
  const clientCode = getVisibleClientCode();
  const cart = loadCart(clientCode);
  const cartItemsEl = document.getElementById('cart-items');
  const subtotalEl = document.getElementById('subtotal') || document.getElementById('subtotal-val');
  const shippingEl = document.getElementById('shipping') || document.getElementById('delivery') || document.getElementById('delivery-val');
  const totalEl = document.getElementById('total') || document.getElementById('total-val');
  const countEl = document.getElementById('cart-count');

  if (cartItemsEl) {
    cartItemsEl.innerHTML = '';
    cart.forEach(item => {
      const p = document.createElement('p');
      p.innerHTML = `${item.name} x${item.quantity} = ${(item.price * item.quantity).toFixed(2)}$ 
        <button class="btn btn-sm btn-danger ms-2" onclick="removeItemFromCart('${clientCode}', ${item.id})">❌</button>`;
      cartItemsEl.appendChild(p);
    });
  }

  const subtotal = cart.reduce((s, it) => s + it.price * it.quantity, 0);
  const shipping = subtotal > 20 ? 0 : 5;
  const total = subtotal + shipping;

  if (subtotalEl) subtotalEl.textContent = subtotal.toFixed(2);
  if (shippingEl) shippingEl.textContent = shipping.toFixed(2);
  if (totalEl) totalEl.textContent = total.toFixed(2);
  if (countEl) countEl.textContent = cart.reduce((s, it) => s + it.quantity, 0);

  // free shipping message if present
  const freeMsg = document.getElementById('free-shipping-msg');
  if (freeMsg) freeMsg.style.display = shipping === 0 ? 'block' : 'none';
}

// ---------- Invoice generation & PDF ----------
function generateInvoiceHTML(clientCode, paymentMethod = 'magasin') {
  const cart = loadCart(clientCode);
  if (!cart.length) return null;

  const orderNum = 'CMD-' + Date.now();
  const dateStr = new Date().toLocaleString('fr-FR');
  let subtotal = 0;
  let rows = '';
  cart.forEach(it => {
    const line = (it.price * it.quantity);
    subtotal += line;
    rows += `<tr>
      <td>${it.name}</td>
      <td class="text-center">${it.quantity}</td>
      <td class="text-end">${it.price.toFixed(2)} $</td>
      <td class="text-end">${line.toFixed(2)} $</td>
    </tr>`;
  });
  const shipping = subtotal > 20 ? 0 : 5;
  const total = subtotal + shipping;

  const html = `
    <div class="invoice-details">
      <h5>Facture détaillée</h5>
      <p><strong>N° Commande:</strong> ${orderNum}</p>
      <p><strong>Code client:</strong> ${clientCode}</p>
      <p><strong>Date:</strong> ${dateStr}</p>
      <table class="table table-sm mt-3">
        <thead class="table-light">
          <tr><th>Article</th><th class="text-center">Qté</th><th class="text-end">Prix</th><th class="text-end">Total</th></tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
        <tfoot>
          <tr><td colspan="3" class="text-end">Sous-total</td><td class="text-end">${subtotal.toFixed(2)} $</td></tr>
          <tr><td colspan="3" class="text-end">Livraison</td><td class="text-end">${shipping.toFixed(2)} $</td></tr>
          <tr class="table-active"><td colspan="3" class="text-end"><strong>Total</strong></td><td class="text-end"><strong>${total.toFixed(2)} $</strong></td></tr>
        </tfoot>
      </table>
      <p><strong>Mode de paiement choisi:</strong> ${paymentMethod}</p>
      <p class="text-muted">Paiement en ligne: ${isOnlinePaymentEnabled() ? 'Disponible' : 'Indisponible'}</p>
    </div>
  `;
  return { html, orderNum, dateStr, subtotal, shipping, total };
}

// Download invoice as TXT (fallback) or PDF via jsPDF
function downloadInvoicePDF(clientCode, paymentMethod = 'magasin') {
  const invoice = generateInvoiceHTML(clientCode, paymentMethod);
  if (!invoice) { alert("Panier vide."); return; }

  // If jsPDF available, create PDF; else download plain text
  if (window.jspdf && window.jspdf.jsPDF) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Title
    doc.setFontSize(16);
    doc.text("Facture - Carrefour des Initiatives", 14, 20);
    doc.setFontSize(11);
    doc.text(`Commande: ${invoice.orderNum}`, 14, 30);
    doc.text(`Date: ${invoice.dateStr}`, 14, 36);

    // Build table body for autotable
    const body = loadCart(clientCode).map(it => [
      it.name, String(it.quantity), it.price.toFixed(2) + " $", (it.price * it.quantity).toFixed(2) + " $"
    ]);
    doc.autoTable({
      startY: 45,
      head: [['Article', 'Qté', 'Prix unitaire', 'Total']],
      body: body,
    });

    doc.text(`Total: ${invoice.total.toFixed(2)} $`, 14, doc.lastAutoTable.finalY + 12);
    doc.text(`Mode paiement: ${paymentMethod}`, 14, doc.lastAutoTable.finalY + 20);
    doc.save(`facture_${invoice.orderNum}.pdf`);
  } else {
    // Fallback TXT
    const txtLines = [];
    txtLines.push(`FACTURE - Commande ${invoice.orderNum}`);
    txtLines.push(`Date: ${invoice.dateStr}`);
    txtLines.push('');
    loadCart(clientCode).forEach(it => txtLines.push(`- ${it.name} x${it.quantity} = ${(it.price * it.quantity).toFixed(2)} $`));
    txtLines.push('');
    txtLines.push(`Sous-total: ${invoice.subtotal.toFixed(2)} $`);
    txtLines.push(`Livraison: ${invoice.shipping.toFixed(2)} $`);
    txtLines.push(`Total: ${invoice.total.toFixed(2)} $`);
    txtLines.push('');
    txtLines.push(`Mode de paiement: ${paymentMethod}`);
    const blob = new Blob([txtLines.join('\n')], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `facture_${invoice.orderNum}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }
}

// ---------- Admin & payment ----------
function isOnlinePaymentEnabled() {
  return localStorage.getItem('onlinePayment') === 'true';
}
// Admin toggler (call from admin UI): set localStorage 'onlinePayment' to 'true' or 'false'
function setOnlinePayment(enabled) {
  localStorage.setItem('onlinePayment', enabled ? 'true' : 'false');
}

// ---------- Utility wrappers for pages ----------
window.CartAPI = {
  initStock,
  loadStock,
  saveStock,
  updateStockUI,
  loadCart,
  saveCart,
  addToCartObj,
  addToCartById,
  removeItemFromCart,
  clearCartForClient,
  updateCartUI,
  generateInvoiceHTML,
  downloadInvoicePDF,
  isOnlinePaymentEnabled,
  setOnlinePayment
};

// auto-update UI on load (if pages include elements)
document.addEventListener('DOMContentLoaded', () => {
  updateCartUI();
  updateStockUI();
});
