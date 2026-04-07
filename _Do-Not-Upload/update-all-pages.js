// Utility script to update all service pages with Cognito Forms handler
// This script can be run once to ensure all pages have the necessary script

const servicePages = [
    'services/yoga.html',
    'services/pilates.html',
    'services/sports-specific-training.html',
    'services/course-venues.html'
];

function updateServicePage(pagePath) {
    const fs = require('fs');
    const path = require('path');
    
    try {
        const fullPath = path.join(__dirname, '..', pagePath);
        let content = fs.readFileSync(fullPath, 'utf8');
        
        // Check if the script is already added
        if (!content.includes('cognito-forms-handler.js')) {
            // Add the script before the closing body tag
            content = content.replace(
                /  <script src="\.\.\/js\/include-footer\.js" type="text\/javascript"><\/script>\s*  <!-- \[if lte IE 9\]><script src="https:\/\/cdnjs\.cloudflare\.com\/ajax\/libs\/placeholders\/3\.0\.2\/placeholders\.min\.js"><\/script><!\[endif\] -->/,
                '  <script src="../js/include-footer.js" type="text/javascript"></script>\n  <script src="../js/cognito-forms-handler.js" type="text/javascript"></script>\n  <!-- [if lte IE 9]><script src="https://cdnjs.cloudflare.com/ajax/libs/placeholders/3.0.2/placeholders.min.js"></script><![endif] -->'
            );
            
            fs.writeFileSync(fullPath, content, 'utf8');
            console.log(`Updated ${pagePath}`);
        } else {
            console.log(`${pagePath} already has the script`);
        }
    } catch (error) {
        console.error(`Error updating ${pagePath}:`, error.message);
    }
}

// If running in Node.js environment, execute the updates
if (typeof module !== 'undefined' && module.exports) {
    servicePages.forEach(updateServicePage);
}

// Export for potential use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { updateServicePage, servicePages };
}
