// config.js - À inclure dans toutes les pages
const ADMIN_PASSWORD = "admin123";
let stripeAvailable = false;
let adminLoggedIn = false;

// Produits communs à toutes les pages (ou charger depuis API)
const ALL_PRODUCTS = {
  fruits_legumes: [
    {id:1, name:'Pommes (1 kg)', price:2.5, img:'assets/fruits/pommes.jpg', category:'fruits', tag:'vedette', stock:10},
    {id:2, name:'Carottes (1 kg)', price:1.8, img:'assets/fruits/carottes.jpg', category:'legumes', tag:'nouveau', stock:15},
    {id:3, name:'Oranges (1 kg)', price:3.0, img:'assets/fruits/oranges.jpg', category:'fruits', tag:'top', stock:12}
  ],
  produits_secs: [
    {id:101, name:'Riz Basmati (1 kg)', price:3.5, img:'assets/dry/riz_basmati.jpg', category:'pates', tag:'vedette', stock:15},
    {id:102, name:'Pâtes Spaghetti (500g)', price:1.8, img:'assets/dry/pates_spaghetti.jpg', category:'pates', tag:'top', stock:20},
    {id:103, name:'Lentilles vertes (500g)', price:2.2, img:'assets/dry/lentilles.jpg', category:'cereales', tag:'nouveau', stock:12}
  ]
};

// Fonctions utilitaires communes
function getCart(clientCode) {
  return JSON.parse(localStorage.getItem(clientCode) || '[]');
}

function saveCart(clientCode, cart) {
  localStorage.setItem(clientCode, JSON.stringify(cart));
}

function updateStock(productId, quantity) {
  // Cette fonction devrait idéalement appeler une API backend
  // Pour l'instant, on gère le stock côté client
  const allProducts = [...ALL_PRODUCTS.fruits_legumes, ...ALL_PRODUCTS.produits_secs];
  const product = allProducts.find(p => p.id === productId);
  if (product) {
    product.stock -= quantity;
  }
}
