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
  
  console.log('Initializing hamburger menu:', { hamburgerBtn, dropdownNav });
  
  if (hamburgerBtn && dropdownNav) {
    hamburgerBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      console.log('Hamburger clicked');
      dropdownNav.classList.toggle('active');
      hamburgerBtn.classList.toggle('active');
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!hamburgerBtn.contains(e.target) && !dropdownNav.contains(e.target)) {
        dropdownNav.classList.remove('active');
        hamburgerBtn.classList.remove('active');
      }
    });

    // Close menu when clicking on a link
    const dropdownLinks = document.querySelectorAll('.dropdown-link');
    dropdownLinks.forEach(link => {
      link.addEventListener('click', () => {
        dropdownNav.classList.remove('active');
        hamburgerBtn.classList.remove('active');
      });
    });
  } else {
    console.error('Hamburger menu elements not found');
  }
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
      const currentPath = window.location.pathname.split('/').pop() || 'index.html';
      const links = document.querySelectorAll('.dropdown-link');
      links.forEach(link => {
        const href = (link.getAttribute('href') || '').trim();
        if (href === currentPath) {
          link.classList.add('is-active');
        }
      });
    } catch (e) {
      console.warn('Active link highlight skipped:', e);
    }
  });
  loadComponent('footer-component', footerPath);
});
