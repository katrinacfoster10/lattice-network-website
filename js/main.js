/* ============================================================
   THE LATTICE — site behaviour

   1. Section CTAs tick the matching interest checkbox in the form
   2. Inline validation (required names, valid email, city and province)
   3. Submit over fetch, so success replaces the form inside the same
      panel rather than navigating away

   There is no scroll animation in this direction, by design. If any
   is ever added, gate it behind prefers-reduced-motion.
   ============================================================ */

(function () {
  'use strict';

  var form = document.querySelector('form.signup');
  var panel = document.getElementById('form-panel');

  if (!form) return;

  /* Custom messages replace the browser's own, so novalidate goes on here
     rather than in the markup. If this script never runs, the browser keeps
     enforcing required and an empty submission cannot get through. */
  form.setAttribute('novalidate', '');

  /* ---- Group summaries ----
     Each collapsible group shows its options while empty and the actual
     selections once there are any, so a closed group never hides what it
     is asking. */
  var PLACEHOLDER = {
    interest: 'Peer Circles, workshops, events\u2026',
    session: 'Two dates in September'
  };

  function paintSummary(name) {
    var node = document.getElementById(name + '-summary');
    if (!node) return;
    var picked = Array.prototype.map.call(
      form.querySelectorAll('input[name="' + name + '"]:checked'),
      function (el) { return el.value; }
    );
    node.textContent = picked.length ? picked.join(', ') : PLACEHOLDER[name];
    node.classList.toggle('is-empty', picked.length === 0);
  }

  /* ---- 1. Tick the matching interest from a section CTA ----
     A CTA scrolls to the form AND ticks its checkbox, opening the group so
     the visitor sees it happen. Matching is by exact value, so a
     data-interest string that drifts from its checkbox silently stops
     working — the values in index.html are the contract. A CTA with no
     matching option carries no data-interest and simply scrolls. */
  document.querySelectorAll('[data-interest]').forEach(function (el) {
    el.addEventListener('click', function () {
      var box = form.querySelector(
        'input[name="interest"][value="' + el.getAttribute('data-interest') + '"]'
      );
      if (!box) return;
      box.checked = true;
      var group = box.closest('details');
      if (group) group.open = true;
      paintSummary('interest');
    });
  });

  form.addEventListener('change', function () {
    paintSummary('interest');
    paintSummary('session');
  });

  /* ---- 2. Inline validation ---- */

  var MESSAGES = {
    'first-name': 'Please enter your first name.',
    'last-name': 'Please enter your last name.',
    email: 'Please enter a valid email address.',
    city: 'Please enter your city or town.',
    province: 'Please choose your province or territory.'
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

  /* ---- 3. Submit ----
     Netlify captures the submission from the POST body; the form-name
     hidden field is what routes it to the "early-access" form. Posting
     over fetch keeps the visitor on the page. If the fetch fails (the
     page opened from disk, or the network dropped) the form falls back
     to a normal browser submit rather than swallowing the entry. */

  function showSuccess() {
    if (!panel) return;
    var done = document.createElement('div');
    done.className = 'form-done';
    done.setAttribute('role', 'status');
    done.setAttribute('tabindex', '-1');

    var heading = document.createElement('h3');
    heading.textContent = 'You\'re on the list.';

    var body = document.createElement('p');
    body.textContent = 'We\'ll keep in touch as we build our community.';

    done.appendChild(heading);
    done.appendChild(body);
    panel.replaceChildren(done);
    done.focus();
  }

  var submitting = false;

  form.addEventListener('submit', function (event) {
    var firstInvalid = null;

    fields.forEach(function (field) {
      if (!validate(field) && !firstInvalid) firstInvalid = field;
    });

    if (firstInvalid) {
      event.preventDefault();
      firstInvalid.focus();
      return;
    }

    if (submitting) return;      // second pass: let the native submit run

    event.preventDefault();
    submitting = true;

    var button = form.querySelector('button[type="submit"]');
    if (button) {
      button.disabled = true;
      button.textContent = 'Sending…';
    }

    window.fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(new FormData(form)).toString()
    })
      .then(function (response) {
        if (!response.ok) throw new Error('Netlify returned ' + response.status);
        showSuccess();
      })
      .catch(function () {
        // Hand the submission back to the browser rather than lose it.
        submitting = true;
        form.submit();
      });
  });
})();
