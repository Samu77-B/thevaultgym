// Script to add consistent footer to all pages
document.addEventListener("DOMContentLoaded", function() {
  const footerHTML = `
  <div class="section-13 wf-section">
    <div class="container-2 w-container">
      <div class="footer-wrapper">
        <!-- Newsletter Signup Section -->
        <div class="footer-column newsletter">
          <h3 class="footer-heading">Be the First to Know!</h3>
          <p class="footer-text">Sign up for the latest news and updates from Roar Fitness</p>
          <form id="newsletter-form">
            <div class="footer-form-row">
              <input type="text" class="footer-form-input" placeholder="First Name" required>
              <input type="text" class="footer-form-input" placeholder="Last Name" required>
            </div>
            <input type="email" class="footer-form-input" placeholder="Email" required>
            <button type="submit" class="footer-btn">SUBSCRIBE NOW!</button>
          </form>
        </div>
        
        <!-- Quick Links Section -->
        <div class="footer-column">
          <h3 class="footer-heading">Quick Links</h3>
          <a href="about.html" class="footer-link">About Us</a>
          <a href="pt-consultations.html" class="footer-link">PT Consultation</a>
          <a href="#" class="footer-link">Partners</a>
          <a href="#" class="footer-link">Testimonials</a>
        </div>
        
        <!-- More Info Section -->
        <div class="footer-column">
          <h3 class="footer-heading">More Info</h3>
          <a href="#" class="footer-link">Our Locations</a>
          <a href="privacy-policy.html" class="footer-link">Privacy Policy</a>
          <a href="testimonials.html" class="footer-link">Testimonials</a>
          <a href="#" class="footer-link">Faqs</a>
          <a href="terms.html" class="footer-link">Terms and Conditions</a>
        </div>
        
        <!-- Follow Us Section -->
        <div class="footer-column">
          <h3 class="footer-heading">Follow us on</h3>
          <div class="footer-social">
            <a href="https://www.instagram.com/" class="social-icon" target="_blank" aria-label="Instagram">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"><path fill="white" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
            </a>
            <a href="https://www.facebook.com/" class="social-icon" target="_blank" aria-label="Facebook">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"><path fill="white" d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/></svg>
            </a>
            <a href="https://twitter.com/" class="social-icon" target="_blank" aria-label="Twitter">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"><path fill="white" d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
            </a>
          </div>
          <a href="contact.html" class="touch-btn">GET IN TOUCH</a>
        </div>
      </div>
      
      <!-- Divider -->
      <div class="footer-divider"></div>
      
      <!-- Locations Section -->
      <div class="location-info">
        <div class="location">
          <h4>London Kensington</h4>
          <p>100 High Street, Kensington, High Street,</p>
          <p>London</p>
          <p>W8 7SU</p>
        </div>
        
        <div class="location">
          <h4>London City</h4>
          <p>8 Guild Street</p>
          <p>London</p>
          <p>EC3N 1AU</p>
        </div>
        
        <div class="location">
          <h4>Dubai</h4>
          <p>Sheikh Mohammed bin Rashid Boulevard, Downtown,</p>
          <p>Burj Vista Tower 2</p>
          <p>Downtown, Dubai, UAE</p>
        </div>
      </div>
      
      <div class="copyright">
        <p>© <span id="copyright-year-legacy"></span> Roar Fitness. All Rights Reserved</p>
      </div>
    </div>
  </div>
  `;

  // Function to check for and remove any existing footer
  function removeExistingFooter() {
    // Look for elements that might be footers
    const possibleFooters = document.querySelectorAll('.section-13');
    possibleFooters.forEach(footer => {
      footer.parentNode.removeChild(footer);
    });
  }

  // Remove any existing footer
  removeExistingFooter();

  // Create a container for the new footer
  const footerContainer = document.createElement('div');
  footerContainer.innerHTML = footerHTML;

  // Add the footer just before the end of the body
  document.body.appendChild(footerContainer.firstElementChild);

  // Set up newsletter form submission
  const newsletterForm = document.getElementById('newsletter-form');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', function(e) {
      e.preventDefault();
      alert('Thank you for subscribing!');
    });
  }
  
  // Auto-update copyright year
  const yearElement = document.getElementById('copyright-year-legacy');
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }
});
