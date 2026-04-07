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

// Footer Component Loader
document.addEventListener('DOMContentLoaded', function() {
    // Check if footer component is already loaded
    if (!document.querySelector('.footer-component-loaded')) {
        loadFooterComponent();
    }
});

function loadFooterComponent() {
    // Determine the correct path to the footer component based on current page location
    let componentPath = 'components/footer.html';
    
    // Check if we're in a subdirectory (like services/)
    if (window.location.pathname.includes('/services/')) {
        componentPath = '../components/footer.html';
    }
    
    fetch(componentPath)
        .then(response => response.text())
        .then(html => {
            // Fix image paths based on current page location
            const isSubdirectory = window.location.pathname.includes('/services/');
            if (isSubdirectory) {
                // Fix paths in component HTML for subdirectories
                html = html.replace(/src=["'](images|icons)\//g, 'src="../$1/');
                html = html.replace(/href=["'](images|icons)\//g, 'href="../$1/');
            }
            
            // Sanitize HTML before inserting to prevent XSS
            const sanitizedHtml = sanitizeHTML(html);
            
            // Create a container for the footer
            const footerContainer = document.createElement('div');
            footerContainer.className = 'footer-component-loaded';
            footerContainer.innerHTML = sanitizedHtml;
            
            // Insert the footer before the closing body tag
            document.body.appendChild(footerContainer);
            
            // Cognito seamless embed (scripts are stripped from fetched HTML by sanitizeHTML)
            const footerMount = document.getElementById('cognito-footer-form-mount');
            if (footerMount) {
                const s = document.createElement('script');
                s.src = 'https://www.cognitoforms.com/f/seamless.js';
                s.async = true;
                s.setAttribute('data-key', 'nra8M7-W5EyCgKiqoaohEw');
                s.setAttribute('data-form', '53');
                footerMount.appendChild(s);
            }
            
            // Dispatch custom event to notify that footer is loaded
            document.dispatchEvent(new CustomEvent('footerLoaded'));
        })
        .catch(error => {
            console.error('Error loading footer component:', error);
        });
}
