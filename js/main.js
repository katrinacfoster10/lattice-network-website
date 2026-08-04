/* ============================================================
   THE LATTICE — site behaviour
   1. Section CTAs pre-select the matching interest in the form
   2. Inline form validation on blur (per the brand handoff)
   ============================================================ */

(function () {
  'use strict';

  var select = document.getElementById('interest');

  /* ---- 1. Pre-select interest from a section CTA ---- */
  if (select) {
    document.querySelectorAll('[data-interest]').forEach(function (el) {
      el.addEventListener('click', function () {
        var value = el.getAttribute('data-interest');
        var match = Array.prototype.filter.call(select.options, function (o) {
          return o.value === value;
        })[0];
        if (match) {
          select.value = value;
          clearError(select);
        }
      });
    });
  }

  /* ---- 2. Inline validation ---- */
  var form = document.querySelector('form.signup');
  if (!form) return;

  var MESSAGES = {
    name: 'Please enter your name.',
    email: 'Please enter a valid email address.',
    interest: 'Please choose what you\'re most interested in.'
  };

  function errorNodeFor(field) {
    var id = field.getAttribute('aria-describedby');
    return id ? document.getElementById(id) : null;
  }

  function showError(field, message) {
    field.setAttribute('aria-invalid', 'true');
    var node = errorNodeFor(field);
    if (node) node.textContent = message;
  }

  function clearError(field) {
    field.removeAttribute('aria-invalid');
    var node = errorNodeFor(field);
    if (node) node.textContent = '';
  }

  function validate(field) {
    var value = (field.value || '').trim();

    if (!value) {
      showError(field, MESSAGES[field.name] || 'This field is required.');
      return false;
    }
    // Browser-native email check, so we don't hand-roll a regex.
    if (field.type === 'email' && !field.checkValidity()) {
      showError(field, MESSAGES.email);
      return false;
    }
    clearError(field);
    return true;
  }

  var fields = Array.prototype.slice.call(
    form.querySelectorAll('input[required], select[required]')
  );

  fields.forEach(function (field) {
    field.addEventListener('blur', function () { validate(field); });
    // Once a field is marked invalid, re-check as the user corrects it.
    field.addEventListener('input', function () {
      if (field.getAttribute('aria-invalid') === 'true') validate(field);
    });
    field.addEventListener('change', function () {
      if (field.getAttribute('aria-invalid') === 'true') validate(field);
    });
  });

  form.addEventListener('submit', function (event) {
    var firstInvalid = null;

    fields.forEach(function (field) {
      if (!validate(field) && !firstInvalid) firstInvalid = field;
    });

    if (firstInvalid) {
      event.preventDefault();
      firstInvalid.focus();
    }
  });
})();
