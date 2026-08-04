/* ============================================================
   THE LATTICE — analytics consent

   Google Analytics is NOT loaded until the visitor clicks Accept.
   This is the part most cookie banners get wrong: they load the
   tracker on page load and then "respect" the choice afterwards,
   by which point the cookie is already set. Here the gtag script
   tag is only created inside loadAnalytics(), which only runs on
   an explicit grant or a previously stored grant.

   The choice is remembered in localStorage and can be changed from
   the "Cookie settings" link in the footer.
   ============================================================ */

(function () {
  'use strict';

  /* ---------------------------------------------------------
     REPLACE THIS with your GA4 Measurement ID.
     Google Analytics → Admin → Data Streams → your web stream.
     It looks like G-ABC1234XYZ.
     While the placeholder is here, Accept stores the choice but
     loads nothing, so the banner can be tested before setup.
     --------------------------------------------------------- */
  var GA_MEASUREMENT_ID = 'G-XXXXXXXXXX';

  var STORAGE_KEY = 'lattice-consent';
  var banner;

  function readChoice() {
    try { return window.localStorage.getItem(STORAGE_KEY); }
    catch (e) { return null; }   // Safari private mode throws
  }

  function saveChoice(value) {
    try { window.localStorage.setItem(STORAGE_KEY, value); }
    catch (e) { /* choice simply won't persist; not worth failing over */ }
  }

  function loadAnalytics() {
    if (window.__latticeAnalyticsLoaded) return;
    if (GA_MEASUREMENT_ID.indexOf('XXXX') !== -1) {
      // Placeholder ID — nothing to load yet.
      return;
    }
    window.__latticeAnalyticsLoaded = true;

    var tag = document.createElement('script');
    tag.async = true;
    tag.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_MEASUREMENT_ID;
    document.head.appendChild(tag);

    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', GA_MEASUREMENT_ID);
  }

  function show() { banner.hidden = false; }
  function hide() { banner.hidden = true; }

  function init() {
    banner = document.getElementById('consent');
    if (!banner) return;

    var accept  = document.getElementById('consent-accept');
    var decline = document.getElementById('consent-decline');
    var reopen  = document.getElementById('consent-reopen');

    accept.addEventListener('click', function () {
      saveChoice('granted');
      hide();
      loadAnalytics();
    });

    decline.addEventListener('click', function () {
      saveChoice('denied');
      hide();
    });

    if (reopen) {
      reopen.addEventListener('click', function (event) {
        event.preventDefault();
        show();
        accept.focus();
      });
    }

    var choice = readChoice();
    if (choice === 'granted') { loadAnalytics(); return; }
    if (choice === 'denied')  { return; }
    show();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
