// HTML Sanitization Utility
// Simple XSS prevention for innerHTML assignments

function sanitizeHTML(html) {
    if (!html || typeof html !== 'string') {
        return '';
    }
    
    // Create a temporary div element
    const temp = document.createElement('div');
    temp.textContent = html;
    
    // Get the sanitized HTML (textContent escapes HTML entities)
    // For trusted HTML content, we'll use a DOMParser approach
    // This is a basic sanitizer - for production, consider using DOMPurify library
    
    // For now, we'll parse and reconstruct safe HTML
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // Remove script tags and event handlers
    const scripts = doc.querySelectorAll('script');
    scripts.forEach(script => script.remove());
    
    // Remove event handlers from all elements
    const allElements = doc.querySelectorAll('*');
    allElements.forEach(el => {
        // Remove common event handler attributes
        const eventAttrs = ['onclick', 'onerror', 'onload', 'onmouseover', 'onfocus', 'onblur'];
        eventAttrs.forEach(attr => {
            if (el.hasAttribute(attr)) {
                el.removeAttribute(attr);
            }
        });
    });
    
    return doc.body.innerHTML;
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = sanitizeHTML;
}
