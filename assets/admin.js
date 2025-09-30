// admin.js - Gestion administrateur
class AdminManager {
  constructor() {
    this.stripeAvailable = JSON.parse(localStorage.getItem('stripeAvailable')) ?? true;
    this.products = JSON.parse(localStorage.getItem('adminProducts')) || [
      {id:1, name:'Pommes (1 kg)', price:2.5, stock:10, tag:'vedette'},
      {id:2, name:'Carottes (1 kg)', price:1.8, stock:15, tag:'nouveau'},
      {id:3, name:'Oranges (1 kg)', price:3.0, stock:12, tag:'top'}
    ];
    
    this.init();
  }

  init() {
    this.renderAdminPanel();
    this.setupAdminEvents();
    this.updateGlobalStripeStatus();
  }

  // Affichage du panneau admin
  renderAdminPanel() {
    const adminSection = document.getElementById('admin-section');
    if (!adminSection) return;

    adminSection.innerHTML = `
      <div class="admin-panel mt-4 p-3 border rounded bg-light">
        <h4>🔧 Panneau Administrateur</h4>
        
        <div class="row">
          <div class="col-md-6">
            <div class="form-check form-switch mb-3">
              <input class="form-check-input" type="checkbox" id="stripe-toggle" 
                     ${this.stripeAvailable ? 'checked' : ''}>
              <label class="form-check-label" for="stripe-toggle">
                Paiement en ligne activé
              </label>
            </div>
            <button class="btn btn-warning btn-sm" onclick="adminManager.resetStocks()">
              🔄 Réinitialiser les stocks
            </button>
          </div>
          
          <div class="col-md-6">
            <h6>Gestion des stocks:</h6>
            <div id="stock-management">
              ${this.renderStockControls()}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // Contrôles de gestion des stocks
  renderStockControls() {
    return this.products.map(product => `
      <div class="d-flex justify-content-between align-items-center mb-2">
        <span>${product.name}</span>
        <div>
          <input type="number" id="stock-${product.id}" 
                 value="${product.stock}" min="0" class="form-control form-control-sm" 
                 style="width: 80px; display: inline-block;">
          <button class="btn btn-success btn-sm ms-1" 
                  onclick="adminManager.updateStock(${product.id})">
            💾
          </button>
        </div>
      </div>
    `).join('');
  }

  // Configuration des événements admin
  setupAdminEvents() {
    const stripeToggle = document.getElementById('stripe-toggle');
    if (stripeToggle) {
      stripeToggle.addEventListener('change', (e) => {
        this.toggleStripePayment(e.target.checked);
      });
    }
  }

  // Activation/désactivation Stripe
  toggleStripePayment(enabled) {
    this.stripeAvailable = enabled;
    localStorage.setItem('stripeAvailable', JSON.stringify(enabled));
    this.updateGlobalStripeStatus();
    
    // Mise à jour de l'alerte sur toutes les pages
    const adminAlert = document.getElementById('admin-alert');
    if (adminAlert) {
      adminAlert.style.display = enabled ? 'none' : 'block';
    }
    
    alert(`Paiement en ligne ${enabled ? 'activé' : 'désactivé'}`);
  }

  // Mise à jour globale du statut Stripe
  updateGlobalStripeStatus() {
    // Cette variable sera lue par store.js
    window.stripeAvailable = this.stripeAvailable;
  }

  // Mise à jour du stock
  updateStock(productId) {
    const stockInput = document.getElementById(`stock-${productId}`);
    const newStock = parseInt(stockInput.value);
    
    if (isNaN(newStock) || newStock < 0) {
      alert('Valeur de stock invalide');
      return;
    }

    const product = this.products.find(p => p.id === productId);
    if (product) {
      product.stock = newStock;
      localStorage.setItem('adminProducts', JSON.stringify(this.products));
      
      // Mettre à jour les produits dans store.js
      if (window.products) {
        const storeProduct = window.products.find(p => p.id === productId);
        if (storeProduct) {
          storeProduct.stock = newStock;
        }
      }
      
      this.renderAdminPanel();
      alert(`Stock de ${product.name} mis à jour: ${newStock}`);
    }
  }

  // Réinitialisation des stocks
  resetStocks() {
    if (confirm('Réinitialiser tous les stocks aux valeurs par défaut?')) {
      this.products.forEach(product => {
        // Réinitialiser à des valeurs par défaut
        const defaultStocks = {1: 10, 2: 15, 3: 12};
        product.stock = defaultStocks[product.id] || 10;
      });
      
      localStorage.setItem('adminProducts', JSON.stringify(this.products));
      this.renderAdminPanel();
      alert('Stocks réinitialisés');
    }
  }
}

// Initialisation de l'admin
let adminManager;
document.addEventListener('DOMContentLoaded', () => {
  adminManager = new AdminManager();
});
