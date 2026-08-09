/**
 * Shared contact form (Cognito form 84) with page-based InquiryType prefill.
 *
 * Cognito form should include a Choice (Dropdown) field with Internal Name:
 *   InquiryType
 * Options (exact labels):
 *   - Work with us
 *   - Train with us
 *   - General enquiry
 *
 * Mount markup (CMS html block or template):
 *   <div class="cognito-form-site cognito-page-form" data-inquiry="train-with-us">
 *     <div class="cognito-page-form-mount"></div>
 *   </div>
 */
(function () {
  var COGNITO_KEY = 'nra8M7-W5EyCgKiqoaohEw';
  var COGNITO_FORM = '84';

  var INQUIRY_LABELS = {
    'work-with-us': 'Work with us',
    'train-with-us': 'Train with us',
    general: 'General enquiry',
  };

  function inquiryFromPath() {
    var path = (window.location.pathname || '').replace(/\/+$/, '').toLowerCase();
    if (path.endsWith('/train-for-a-living') || path.endsWith('train-for-a-living.html')) {
      return 'work-with-us';
    }
    if (path.endsWith('/train-with-a-pro') || path.endsWith('train-with-a-pro.html')) {
      return 'train-with-us';
    }
    return 'general';
  }

  function resolveInquiry(el) {
    var raw = (el.getAttribute('data-inquiry') || '').trim().toLowerCase();
    if (raw && INQUIRY_LABELS[raw]) return raw;
    return inquiryFromPath();
  }

  function loadCognitoScript(cb) {
    if (window.Cognito && typeof window.Cognito.prefill === 'function') {
      cb();
      return;
    }
    var existing = document.querySelector('script[data-vault-cognito-page="1"]');
    if (existing) {
      existing.addEventListener('load', cb);
      return;
    }
    var s = document.createElement('script');
    s.src = 'https://www.cognitoforms.com/f/seamless.js';
    s.async = true;
    s.setAttribute('data-key', COGNITO_KEY);
    s.setAttribute('data-form', COGNITO_FORM);
    s.setAttribute('data-vault-cognito-page', '1');
    s.addEventListener('load', cb);
    // Attach to the first mount so seamless.js has a target; other mounts get prefill only.
    var firstMount = document.querySelector('.cognito-page-form-mount');
    if (firstMount) {
      firstMount.appendChild(s);
    } else {
      document.body.appendChild(s);
    }
  }

  function applyPrefill(inquiryKey) {
    var label = INQUIRY_LABELS[inquiryKey] || INQUIRY_LABELS.general;
    var entry = { InquiryType: label };
    try {
      if (window.Cognito && typeof window.Cognito.prefill === 'function') {
        window.Cognito.prefill(entry);
      }
    } catch (e) {
      console.warn('Cognito prefill skipped:', e);
    }
  }

  function mountForms() {
    var wraps = document.querySelectorAll('.cognito-page-form');
    if (!wraps.length) return;

    var inquiry = resolveInquiry(wraps[0]);
    wraps.forEach(function (wrap) {
      wrap.setAttribute('data-inquiry', resolveInquiry(wrap));
    });

    loadCognitoScript(function () {
      // Seamless embed may need a tick before prefill is available.
      setTimeout(function () {
        applyPrefill(inquiry);
      }, 50);
      setTimeout(function () {
        applyPrefill(inquiry);
      }, 400);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountForms);
  } else {
    mountForms();
  }
})();
