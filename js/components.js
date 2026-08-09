// HTML Sanitization function
function sanitizeHTML(html) {
    if (!html || typeof html !== 'string') {
        return '';
    }
    
    // Create a DOMParser to safely parse HTML
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // Remove script tags
    const scripts = doc.querySelectorAll('script');
    scripts.forEach(script => script.remove());
    
    // Remove event handlers from all elements
    const allElements = doc.querySelectorAll('*');
    allElements.forEach(el => {
        // Remove common event handler attributes
        const eventAttrs = ['onclick', 'onerror', 'onload', 'onmouseover', 'onfocus', 'onblur', 'onchange', 'onsubmit'];
        eventAttrs.forEach(attr => {
            if (el.hasAttribute(attr)) {
                el.removeAttribute(attr);
            }
        });
    });
    
    return doc.body.innerHTML;
}

// Component loader
async function loadComponent(elementId, componentPath) {
  const el = document.getElementById(elementId);
  if (!el) return;
  try {
    const response = await fetch(componentPath);
    let html = await response.text();
    
    // Fix image paths based on current page location
    const isSubdirectory = window.location.pathname.includes('/services/');
    if (isSubdirectory) {
      // Fix paths in component HTML for subdirectories
      html = html.replace(/src=["'](images|icons)\//g, 'src="../$1/');
      html = html.replace(/href=["'](images|icons)\//g, 'href="../$1/');
    }
    
    // Sanitize HTML before inserting to prevent XSS
    const sanitizedHtml = sanitizeHTML(html);
    el.innerHTML = sanitizedHtml;
  } catch (error) {
    console.error('Error loading component:', error);
  }
}

// Hamburger menu functionality
function initHamburgerMenu() {
  const hamburgerBtn = document.querySelector('.hamburger-menu-btn');
  const dropdownNav = document.querySelector('.dropdown-nav');

  if (!hamburgerBtn || !dropdownNav) {
    console.error('Hamburger menu elements not found');
    return;
  }

  function setMenuOpen(open) {
    dropdownNav.classList.toggle('active', open);
    hamburgerBtn.classList.toggle('active', open);
    document.body.classList.toggle('vault-menu-open', open);
    hamburgerBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
  }

  hamburgerBtn.setAttribute('aria-expanded', 'false');
  hamburgerBtn.setAttribute('aria-controls', 'dropdown-nav');

  hamburgerBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    setMenuOpen(!dropdownNav.classList.contains('active'));
  });

  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!hamburgerBtn.contains(e.target) && !dropdownNav.contains(e.target)) {
      setMenuOpen(false);
    }
  });

  // Close menu when clicking on a link
  dropdownNav.querySelectorAll('.dropdown-link').forEach((link) => {
    link.addEventListener('click', () => setMenuOpen(false));
  });

  // Escape closes menu
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') setMenuOpen(false);
  });
}

// Load components when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Determine correct component path based on current page location
  const isSubdirectory = window.location.pathname.includes('/services/');
  const headerPath = isSubdirectory ? '../components/header.html' : 'components/header.html';
  const footerPath = isSubdirectory ? '../components/footer.html' : 'components/footer.html';
  
  // Load header and footer components
  loadComponent('header-component', headerPath).then(() => {
    initHamburgerMenu();
    // Mark active dropdown link based on current path
    try {
      const path = (window.location.pathname || '/').replace(/\/+$/, '') || '/';
      const links = document.querySelectorAll('.dropdown-link');
      links.forEach((link) => {
        const href = (link.getAttribute('href') || '').trim().replace(/\/+$/, '') || '/';
        if (href === path || (href !== '/' && path.endsWith(href))) {
          link.classList.add('is-active');
        }
      });
    } catch (e) {
      console.warn('Active link highlight skipped:', e);
    }
  });
  loadComponent('footer-component', footerPath);
});
