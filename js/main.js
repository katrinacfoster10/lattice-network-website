/* ============================================================
   THE LATTICE — site behaviour
   1. Section CTAs pre-select the matching interest in the form
   2. Inline form validation on blur (per the brand handoff)
   ============================================================ */

(function () {
  'use strict';

  /* ---- 0. Scroll reveal ----
     Progressive enhancement: the hiding class is only ever applied by JS,
     so with scripts off or reduced motion on, everything renders visible. */
  var prefersReducedMotion =
    window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!prefersReducedMotion && 'IntersectionObserver' in window) {
    var reveals = [].slice.call(document.querySelectorAll('[data-reveal]'));

    reveals.forEach(function (el) { el.classList.add('reveal-init'); });

    var observerFired = false;

    var observer = new IntersectionObserver(function (entries) {
      observerFired = true;
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-revealed');
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    reveals.forEach(function (el) { observer.observe(el); });

    /* Fail open. A working IntersectionObserver always delivers an initial
       callback for every observed target, so if nothing has arrived by now
       the API is not functioning in this environment — and without this
       every revealed element would stay at opacity 0 and the page would
       render blank. Content visibility must never depend on animation.

       This sets a class that forces visibility with !important rather than
       just removing `reveal-init`, because un-hiding via a transition would
       itself depend on the rendering pipeline that is evidently unwell. */
    window.setTimeout(function () {
      if (observerFired) return;
      observer.disconnect();
      document.documentElement.classList.add('reveal-disabled');
    }, 1500);
  }

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
