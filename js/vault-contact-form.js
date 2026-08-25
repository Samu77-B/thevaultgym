/**
 * Shared contact form (Cognito form 91) with page-based inquiry prefill.
 *
 * Cognito dropdown internal name is usually YouWantTo (label: "You want to:").
 * Option labels must match Cognito exactly.
 *
 * Mount markup:
 *   <div class="cognito-form-site cognito-page-form" data-inquiry="train-with-us">
 *     <div class="cognito-page-form-mount"></div>
 *   </div>
 */
(function () {
  var COGNITO_KEY = 'nra8M7-W5EyCgKiqoaohEw';
  var COGNITO_FORM = '91';

  /** Primary label sent to Cognito; aliases tried if the first does not stick. */
  var INQUIRY_LABELS = {
    'work-with-us': 'Work with us',
    'train-with-us': 'Train with us',
    general: 'General contact',
  };

  var INQUIRY_FIELD_KEYS = ['YouWantTo', 'InquiryType', 'YouWantToContactUsAbout'];

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

  function buildPrefillPayload(label) {
    var entry = {};
    INQUIRY_FIELD_KEYS.forEach(function (key) {
      entry[key] = label;
    });
    return entry;
  }

  function injectBrandStyles() {
    if (document.getElementById('vault-cognito-brand-css')) return;
    var style = document.createElement('style');
    style.id = 'vault-cognito-brand-css';
    style.textContent = [
      ':root:root:root:root:root .cog-cognito--styled,',
      ':root:root:root:root:root .cog-91 {',
      '  --focus__border-color:#ed155d;',
      '  --focus__box-shadow-color:#ed155d;',
      '  --link__color:#ed155d;',
      '  --choice__selected-color:#ed155d;',
      '  --button-primary__background-color:#ed155d;',
      '}',
      ':root:root:root:root:root .cog-cognito--styled .cog-input:focus,',
      ':root:root:root:root:root .cog-cognito--styled .cog-choice--dropdown .cog-input:focus,',
      ':root:root:root:root:root .cog-cognito--styled select:focus {',
      '  border-color:#ed155d!important;',
      '  outline-color:#ed155d!important;',
      '  box-shadow:0 0 0 1px #ed155d!important;',
      '}',
      ':root:root:root:root:root .cog-cognito--styled .cog-choice__menu-item--highlighted,',
      ':root:root:root:root:root .cog-cognito--styled .cog-choice__menu-item:hover,',
      ':root:root:root:root:root .cog-cognito--styled .cog-choice__menu-item--selected,',
      ':root:root:root:root:root .cog-cognito--styled [role="option"][aria-selected="true"],',
      ':root:root:root:root:root .cog-cognito--styled [role="option"]:hover {',
      '  color:#ed155d!important;',
      '  background-color:rgba(237,21,93,0.12)!important;',
      '}',
    ].join('\n');
    document.head.appendChild(style);
  }

  function applyPrefill(mountId, inquiryKey) {
    var label = INQUIRY_LABELS[inquiryKey] || INQUIRY_LABELS.general;
    var entry = buildPrefillPayload(label);
    var selector = '#' + mountId;

    injectBrandStyles();

    function tryPrefill() {
      if (!window.Cognito) return false;
      try {
        if (typeof window.Cognito.mount === 'function') {
          var mounted = window.Cognito.mount(COGNITO_FORM, selector);
          if (mounted && typeof mounted.prefill === 'function') {
            mounted.prefill(entry);
            return true;
          }
        }
        if (typeof window.Cognito.prefill === 'function') {
          window.Cognito.prefill(entry);
          return true;
        }
      } catch (e) {
        console.warn('Cognito prefill skipped:', e);
      }
      return false;
    }

    tryPrefill();
    [150, 500, 1200, 2500].forEach(function (delay) {
      setTimeout(tryPrefill, delay);
    });
  }

  function mountForms() {
    var wraps = document.querySelectorAll('.cognito-page-form');
    if (!wraps.length) return;

    wraps.forEach(function (wrap, index) {
      if (wrap.querySelector('script[data-vault-cognito-page="1"]')) return;

      var mountId = wrap.id || 'vault-contact-form-' + index;
      wrap.id = mountId;

      var inquiry = resolveInquiry(wrap);
      wrap.setAttribute('data-inquiry', inquiry);

      var s = document.createElement('script');
      s.src = 'https://www.cognitoforms.com/f/seamless.js';
      s.async = true;
      s.setAttribute('data-key', COGNITO_KEY);
      s.setAttribute('data-form', COGNITO_FORM);
      s.setAttribute('data-vault-cognito-page', '1');
      s.addEventListener('load', function () {
        applyPrefill(mountId, inquiry);
      });
      wrap.appendChild(s);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountForms);
  } else {
    mountForms();
  }
})();
