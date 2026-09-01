/* ============================================================
   THE LATTICE — application page behaviour

   1. Inline validation, including checkbox groups (HTML `required`
      on a checkbox means that one box, not "at least one of these",
      so groups are validated here)
   2. Character counter on the bio
   3. Submit over fetch, so success replaces the form inside the same
      card rather than navigating away

   Mirrors js/main.js deliberately: same error-on-blur behaviour, same
   fetch-with-native-fallback submit. If one changes, look at both.
   ============================================================ */

(function () {
  'use strict';

  var form = document.querySelector('form.application');
  var card = document.getElementById('application-card');
  if (!form) return;

  /* Custom messages replace the browser's own, so novalidate goes on here
     rather than in the markup. If this script never runs, the browser keeps
     enforcing required and an empty application cannot get through. */
  form.setAttribute('novalidate', '');

  /* ---- 1. Validation ---- */

  var MESSAGES = {
    'first-name': 'Please enter your first name.',
    'last-name': 'Please enter your last name.',
    email: 'Please enter a valid email address.',
    linkedin: 'Please enter your LinkedIn profile URL.',
    city: 'Please enter your city or town.',
    province: 'Please choose your province or territory.',
    bio: 'Please tell us a little about yourself.',
    stage: 'Please choose your career stage.',
    years: 'Please choose your years at senior level.',
    format: 'Please choose a format preference.',
    'consent-share': 'Please confirm you consent to your profile being shared.'
  };

  /* Checkbox groups needing at least one tick. The key is the input
     name; the value is the message. */
  var GROUPS = {
    sector: 'Please choose at least one sector.',
    expertise: 'Please choose at least one area of expertise.',
    engagement: 'Please choose at least one engagement type.',
    seeking: 'Please choose at least one option.',
    offering: 'Please choose at least one option.',
    availability: 'Please choose at least one option.'
  };

  function errorNodeFor(id) { return document.getElementById(id + '-error'); }

  function showError(el, id, message) {
    el.setAttribute('aria-invalid', 'true');
    var node = errorNodeFor(id);
    if (node) node.textContent = message;
  }

  function clearError(el, id) {
    el.removeAttribute('aria-invalid');
    var node = errorNodeFor(id);
    if (node) node.textContent = '';
  }

  /* A single required control: text, email, url, select, textarea, or
     the lone consent checkbox. */
  function validateField(field) {
    var id = field.id;

    if (field.type === 'checkbox') {
      if (!field.checked) { showError(field, id, MESSAGES[id]); return false; }
      clearError(field, id);
      return true;
    }

    var value = (field.value || '').trim();
    if (!value) { showError(field, id, MESSAGES[id]); return false; }

    /* Browser-native check for email and url, so we don't hand-roll
       a regex. A url field is lenient: people type linkedin.com/in/x
       without a scheme, and rejecting that would be pedantic. */
    if (field.type === 'email' && !field.checkValidity()) {
      showError(field, id, MESSAGES[id]);
      return false;
    }

    clearError(field, id);
    return true;
  }

  function groupBoxes(name) {
    return Array.prototype.slice.call(
      form.querySelectorAll('input[name="' + name + '"]')
    );
  }

  function validateGroup(name) {
    var boxes = groupBoxes(name);
    var wrapper = form.querySelector('[data-group="' + name + '"] .checkgrid');
    var node = errorNodeFor(name);
    var ok = boxes.some(function (b) { return b.checked; });

    if (wrapper) {
      if (ok) wrapper.removeAttribute('aria-invalid');
      else wrapper.setAttribute('aria-invalid', 'true');
    }
    if (node) node.textContent = ok ? '' : GROUPS[name];
    return ok;
  }

  var requiredFields = Array.prototype.slice.call(
    form.querySelectorAll(
      'input[required], select[required], textarea[required]'
    )
  );

  requiredFields.forEach(function (field) {
    field.addEventListener('blur', function () { validateField(field); });
    field.addEventListener('input', function () {
      if (field.getAttribute('aria-invalid') === 'true') validateField(field);
    });
    field.addEventListener('change', function () {
      if (field.getAttribute('aria-invalid') === 'true') validateField(field);
    });
  });

  /* Re-check a group as soon as the applicant ticks something in it,
     so a red group clears the moment it is satisfied. */
  Object.keys(GROUPS).forEach(function (name) {
    groupBoxes(name).forEach(function (box) {
      box.addEventListener('change', function () {
        var node = errorNodeFor(name);
        if (node && node.textContent) validateGroup(name);
      });
    });
  });

  /* ---- 2. Bio character counter ---- */

  var bio = document.getElementById('bio');
  var used = document.getElementById('bio-used');
  var count = document.getElementById('bio-count');

  if (bio && used && count) {
    bio.addEventListener('input', function () {
      var n = bio.value.length;
      used.textContent = n;
      count.classList.toggle('is-near', n > 360);
    });
  }

  /* ---- 3. Submit ----
     Netlify captures the submission from the POST body, routed by the
     form-name hidden field, then redirects to the action path. The
     confirmation is a real page at /application-received rather than a
     message swapped in here, so it has its own URL and survives a refresh. */

  form.addEventListener('submit', function (event) {
    var firstInvalid = null;

    requiredFields.forEach(function (field) {
      if (!validateField(field) && !firstInvalid) firstInvalid = field;
    });

    Object.keys(GROUPS).forEach(function (name) {
      if (!validateGroup(name) && !firstInvalid) {
        firstInvalid = groupBoxes(name)[0] || null;
      }
    });

    if (firstInvalid) {
      event.preventDefault();
      firstInvalid.focus();
      firstInvalid.scrollIntoView({ block: 'center' });
      return;
    }

    /* Deferred, because disabling a submit button inside its own submit
       handler cancels the submission in some browsers. */
    var button = form.querySelector('button[type="submit"]');
    if (button) {
      window.setTimeout(function () {
        button.disabled = true;
        button.textContent = 'Sending…';
      }, 0);
    }
  });
})();
