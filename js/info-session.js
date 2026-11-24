/* ============================================================
   THE LATTICE — Information Session sign-up

   Independent of js/main.js, which is wired to the single
   form.signup element on the page. Submits to Netlify the same
   way that form does, then swaps the form for a confirmation
   holding the Meet link and an Add to Calendar button. Neither
   appears until someone has signed up, on purpose — that is what
   lets Katrina and Jill follow up afterward.

   Monthly upkeep: SESSION below, plus the date line in index.html.
   ============================================================ */

(function () {
  'use strict';

  var SESSION = {
    when: 'Monday, November 30 · 11:30am–12:00pm PT / 2:30–3:00pm ET',
    meetUrl: 'https://meet.google.com/fgn-jwys-obw',
    calendarUrl: 'https://calendar.google.com/calendar/render?action=TEMPLATE&text=The+Lattice+-+Information+Session&dates=20261130T193000Z/20261130T200000Z&details=Free+30-minute+walkthrough+of+The+Lattice+Online+Community+and+Peer+Circles%2C+with+time+for+questions.+Join+on+Google+Meet+https://meet.google.com/fgn-jwys-obw&location=https://meet.google.com/fgn-jwys-obw'
  };

  var form = document.querySelector('form.info-session-form');
  var slot = document.getElementById('info-session-slot');

  if (!form || !slot) return;

  form.setAttribute('novalidate', '');

  var required = Array.prototype.slice.call(form.querySelectorAll('input[required]'));

  function showDone() {
    var done = document.createElement('div');
    done.className = 'info-session-done';
    done.setAttribute('role', 'status');
    done.setAttribute('tabindex', '-1');

    var heading = document.createElement('h3');
    heading.textContent = 'You’re confirmed.';

    var body = document.createElement('p');
    body.textContent = SESSION.when;

    var ctas = document.createElement('div');
    ctas.className = 'info-session-done-ctas';

    var join = document.createElement('a');
    join.className = 'btn btn-cobalt';
    join.href = SESSION.meetUrl;
    join.target = '_blank';
    join.rel = 'noopener noreferrer';
    join.textContent = 'Join on Google Meet';

    var cal = document.createElement('a');
    cal.className = 'text-link';
    cal.href = SESSION.calendarUrl;
    cal.target = '_blank';
    cal.rel = 'noopener noreferrer';
    cal.textContent = 'Add to Google Calendar';

    ctas.appendChild(join);
    ctas.appendChild(cal);
    done.appendChild(heading);
    done.appendChild(body);
    done.appendChild(ctas);

    slot.replaceChildren(done);
    done.focus();
  }

  var submitting = false;

  form.addEventListener('submit', function (event) {
    var firstInvalid = null;

    required.forEach(function (field) {
      var valid = field.value.trim() && field.checkValidity();
      field.toggleAttribute('aria-invalid', !valid);
      if (!valid && !firstInvalid) firstInvalid = field;
    });

    if (firstInvalid) {
      event.preventDefault();
      firstInvalid.focus();
      return;
    }

    if (submitting) return; // second pass: let the native submit run

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
        showDone();
      })
      .catch(function () {
        submitting = true;
        form.submit();
      });
  });
})();
