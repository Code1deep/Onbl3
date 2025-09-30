// store.js - Gestion de la navigation et des produits
const products = [
  {id:1, name:'Pommes (1 kg)', price:2.5, img:'assets/fruits/pommes.jpg', tag:'vedette', stock:10},
  {id:2, name:'Carottes (1 kg)', price:1.8, img:'assets/fruits/carottes.jpg', tag:'nouveau', stock:15},
  {id:3, name:'Oranges (1 kg)', price:3.0, img:'assets/fruits/oranges.jpg', tag:'top', stock:12}
];

let stripeAvailable = true;

// Initialisation de la page
function initStorePage() {
  renderProducts();
  setupEventListeners();
  checkOnlinePaymentStatus();
}

// Affichage des produits
function renderProducts(list = products) {
  const container = document.getElementById('product-list');
  if (!container) return;
  
  container.innerHTML = '';
  list.forEach(p => {
    container.innerHTML += `
    <div class="col-md-4 mb-4">
      <div class="product-card p-3">
        <img src="${p.img}" class="img-fluid rounded mb-2" alt="${p.name}">
        <h5>${p.name}</h5>
        <p><strong>${p.price.toFixed(2)} $</strong></p>
        <p class="stock-info" id="stock-${p.id}">Stock restant: ${p.stock}</p>
        <input type="number" min="1" max="${p.stock}" value="1" id="qty-${p.id}" class="form-control mb-2">
        <button class="btn btn-primary w-100 btn-animate" onclick="addToCart(${p.id})">
          <i class="fa fa-cart-plus"></i> Ajouter au panier
        </button>
      </div>
    </div>`;
  });
}

// Filtrage des produits
function filterProducts() {
  const val = document.getElementById('filter').value;
  let filtered = products;
  if (val !== 'all') filtered = products.filter(p => p.tag === val);
  renderProducts(filtered);
}

// Vérification du statut des paiements en ligne
function checkOnlinePaymentStatus() {
  const adminAlert = document.getElementById('admin-alert');
  if (adminAlert && !stripeAvailable) {
    adminAlert.style.display = 'block';
  }
}

// Configuration des écouteurs d'événements
function setupEventListeners() {
  const clientCodeInput = document.getElementById('clientCode');
  if (clientCodeInput) {
    clientCodeInput.addEventListener('change', function() {
      if (this.value) {
        updateCartUI();
      }
    });
  }
}

// Redirection vers la facture
function viewDetailedInvoice() {
  window.location.href = 'facture.html';
}

// Appel téléphonique
function callOrder() {
  window.location.href = 'tel:5141234567';
}

// Initialisation au chargement
document.addEventListener('DOMContentLoaded', initStorePage);
