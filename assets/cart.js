// cart.js - Gestion du panier uniquement
class CartManager {
  constructor() {
    this.currentClientCode = null;
  }

  // Ajouter au panier avec vérification du stock
  addToCart(productId, quantity = 1) {
    const clientCode = this.getClientCode();
    if (!clientCode) {
      alert("Veuillez entrer votre code client");
      return false;
    }

    const product = window.products.find(p => p.id === productId);
    if (!product) {
      alert("Produit non trouvé");
      return false;
    }

    // Vérification du stock
    if (product.stock < quantity) {
      alert(`Stock insuffisant! Il ne reste que ${product.stock} unité(s) de ${product.name}`);
      return false;
    }

    let cart = this.loadCart(clientCode);
    
    // Mettre à jour ou ajouter l'article
    const existingItem = cart.find(item => item.id === productId);
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: quantity,
        stock: product.stock
      });
    }

    // Décrémenter le stock
    product.stock -= quantity;

    this.saveCart(clientCode, cart);
    this.updateCartUI();
    
    return true;
  }

  // Retirer un article du panier
  removeItem(productId) {
    const clientCode = this.getClientCode();
    if (!clientCode) return;

    let cart = this.loadCart(clientCode);
    const item = cart.find(item => item.id === productId);
    
    if (item) {
      // Restaurer le stock
      const product = window.products.find(p => p.id === productId);
      if (product) {
        product.stock += item.quantity;
      }
      
      cart = cart.filter(item => item.id !== productId);
      this.saveCart(clientCode, cart);
      this.updateCartUI();
    }
  }

  // Vider le panier
  clearCart() {
    const clientCode = this.getClientCode();
    if (!clientCode) return;

    const cart = this.loadCart(clientCode);
    
    // Restaurer tous les stocks
    cart.forEach(item => {
      const product = window.products.find(p => p.id === item.id);
      if (product) {
        product.stock += item.quantity;
      }
    });

    localStorage.removeItem(`cart_${clientCode}`);
    this.updateCartUI();
  }

  // Charger le panier
  loadCart(clientCode) {
    return JSON.parse(localStorage.getItem(`cart_${clientCode}`)) || [];
  }

  // Sauvegarder le panier
  saveCart(clientCode, cart) {
    localStorage.setItem(`cart_${clientCode}`, JSON.stringify(cart));
  }

  // Obtenir le code client
  getClientCode() {
    const input = document.getElementById('clientCode');
    return input ? input.value : null;
  }

  // Mettre à jour l'interface du panier
  updateCartUI() {
    const clientCode = this.getClientCode();
    const cart = clientCode ? this.loadCart(clientCode) : [];
    
    // Mettre à jour le compteur
    const countElement = document.getElementById('cart-count');
    if (countElement) {
      const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
      countElement.textContent = totalItems;
    }

    // Mettre à jour la modal du panier
    this.updateCartModal(cart);
  }

  // Mettre à jour la modal du panier
  updateCartModal(cart) {
    const cartItems = document.getElementById('cart-items');
    const subtotalElement = document.getElementById('subtotal');
    const shippingElement = document.getElementById('shipping');
    const totalElement = document.getElementById('total');
    const freeShippingMsg = document.getElementById('free-shipping-msg');

    if (!cartItems) return;

    let subtotal = 0;
    cartItems.innerHTML = '';

    cart.forEach(item => {
      const itemTotal = item.price * item.quantity;
      subtotal += itemTotal;
      
      cartItems.innerHTML += `
        <div class="d-flex justify-content-between align-items-center mb-2">
          <div>
            <small>${item.name} x${item.quantity}</small>
            <br>
            <strong>${itemTotal.toFixed(2)} $</strong>
          </div>
          <button class="btn btn-sm btn-outline-danger" 
                  onclick="cartManager.removeItem(${item.id})">
            ❌
          </button>
        </div>
      `;
    });

    if (cart.length === 0) {
      cartItems.innerHTML = '<p class="text-muted">Votre panier est vide</p>';
    }

    // Calcul des frais
    const shipping = subtotal > 20 ? 0 : 5;
    const total = subtotal + shipping;

    // Mise à jour des éléments UI
    if (subtotalElement) subtotalElement.textContent = subtotal.toFixed(2);
    if (shippingElement) shippingElement.textContent = shipping.toFixed(2);
    if (totalElement) totalElement.textContent = total.toFixed(2);
    
    if (freeShippingMsg) {
      freeShippingMsg.style.display = shipping === 0 ? 'block' : 'none';
    }

    // Activer/désactiver le bouton Terminer la commande
    this.updateFinishOrderButton(cart.length > 0);
  }

  // Activer/désactiver le bouton Terminer la commande
  updateFinishOrderButton(enable) {
    const finishButton = document.querySelector('button[onclick*="proceedPayment"]');
    if (finishButton) {
      finishButton.disabled = !enable;
      finishButton.style.opacity = enable ? '1' : '0.6';
    }
  }

  // Basculer l'affichage du panier
  toggleCart() {
    const modal = document.getElementById('cart-modal');
    if (modal) {
      modal.style.display = modal.style.display === 'block' ? 'none' : 'block';
      this.updateCartUI();
    }
  }
}

// Initialisation du gestionnaire de panier
const cartManager = new CartManager();

// Fonctions globales pour HTML
function addToCart(productId) {
  const quantityInput = document.getElementById(`qty-${productId}`);
  const quantity = quantityInput ? parseInt(quantityInput.value) : 1;
  cartManager.addToCart(productId, quantity);
}

function removeItem(productId) {
  cartManager.removeItem(productId);
}

function clearCart() {
  cartManager.clearCart();
}

function toggleCart() {
  cartManager.toggleCart();
}
