document.addEventListener('DOMContentLoaded', () => {
  // === THEME MANAGER (LIGHT / DARK MODE) ===
  const themeToggle = document.getElementById('themeToggle');
  const body = document.body;

  // Initialize theme from localStorage
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'light') {
    body.classList.add('light-theme');
    updateThemeIcon(true);
  } else {
    updateThemeIcon(false);
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const isLight = body.classList.toggle('light-theme');
      localStorage.setItem('theme', isLight ? 'light' : 'dark');
      updateThemeIcon(isLight);
    });
  }

  function updateThemeIcon(isLight) {
    if (!themeToggle) return;
    const icon = themeToggle.querySelector('i');
    if (icon) {
      if (isLight) {
        icon.className = 'bx bx-sun';
      } else {
        icon.className = 'bx bx-moon';
      }
    }
  }

  // === HEADER ON SCROLL ===
  const header = document.getElementById('siteHeader');
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });

  // === MOBILE NAVIGATION MENU ===
  const burger = document.getElementById('burger');
  const nav = document.getElementById('nav');
  const overlay = document.getElementById('navOverlay');

  function closeNav() {
    nav.classList.remove('open');
    overlay.classList.remove('show');
    burger.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
  }

  function toggleNav() {
    const isOpen = nav.classList.toggle('open');
    overlay.classList.toggle('show', isOpen);
    burger.classList.toggle('open', isOpen);
    burger.setAttribute('aria-expanded', String(isOpen));
  }

  if (burger) burger.addEventListener('click', toggleNav);
  if (overlay) overlay.addEventListener('click', closeNav);
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', closeNav);
  });

  // === SCROLL REVEAL OBSERVER ===
  let observer;
  function initScrollReveal() {
    // If observer already exists, disconnect it to avoid duplicate triggers
    if (observer) observer.disconnect();
    
    const revealEls = document.querySelectorAll('.reveal');
    observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    
    revealEls.forEach(el => observer.observe(el));
  }

  // Initial reveal for static elements
  initScrollReveal();

  // === DYNAMIC DATED FOOTER ===
  const dateElement = document.querySelector('.date');
  if (dateElement) {
    dateElement.textContent = new Date().getFullYear();
  }

  // === PRODUCTS LOADING (DYNAMIC JSON) ===
  let allProducts = [];

  async function loadProducts() {
    try {
      const response = await fetch('perruques.json');
      if (!response.ok) {
        throw new Error(`Erreur HTTP : status ${response.status}`);
      }
      allProducts = await response.json();
      
      const homeGrid = document.getElementById('homeProductGrid');
      const catalogGrid = document.getElementById('catalogProductGrid');
      
      if (homeGrid) {
        renderHomeProducts(allProducts.slice(0, 6)); // Show first 6 products on homepage
      }
      
      if (catalogGrid) {
        renderCatalogProducts(allProducts);
        setupCatalogControls();
      }
    } catch (error) {
      console.error('Erreur lors du chargement des produits :', error);
      const loadingEls = document.querySelectorAll('.loading');
      loadingEls.forEach(el => {
        el.textContent = 'Impossible de charger les produits pour le moment.';
      });
    }
  }

  function createProductCard(product) {
    const article = document.createElement('article');
    article.className = 'card reveal';
    article.innerHTML = `
      <img src="${product.image}" alt="${product.nom}" loading="lazy">
      <div class="card-info">
        <span class="eyebrow">${product.type}</span>
        <h3>${product.nom}</h3>
        <span class="price">${product.prix}</span>
      </div>
    `;
    return article;
  }

  function renderHomeProducts(products) {
    const grid = document.getElementById('homeProductGrid');
    if (!grid) return;
    grid.innerHTML = '';
    products.forEach(product => {
      grid.appendChild(createProductCard(product));
    });
    // Re-run scroll reveal to detect newly added products
    setTimeout(initScrollReveal, 50);
  }

  function renderCatalogProducts(products) {
    const grid = document.getElementById('catalogProductGrid');
    if (!grid) return;
    grid.innerHTML = '';
    
    if (products.length === 0) {
      grid.innerHTML = '<div class="loading">Aucun produit ne correspond à vos critères.</div>';
      return;
    }
    
    products.forEach(product => {
      grid.appendChild(createProductCard(product));
    });
    // Re-run scroll reveal to detect newly added products
    setTimeout(initScrollReveal, 50);
  }

  function setupCatalogControls() {
    const searchInput = document.getElementById('searchInput');
    const filterBtns = document.querySelectorAll('.filter-btn');
    
    let activeFilter = 'all';
    let searchQuery = '';
    
    function applyFilters() {
      const filtered = allProducts.filter(product => {
        const matchesSearch = product.nom.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = activeFilter === 'all' || product.type.toLowerCase() === activeFilter.toLowerCase();
        return matchesSearch && matchesCategory;
      });
      renderCatalogProducts(filtered);
    }
    
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        applyFilters();
      });
    }
    
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeFilter = btn.getAttribute('data-filter');
        applyFilters();
      });
    });
  }

  // Load the products
  loadProducts();
});
