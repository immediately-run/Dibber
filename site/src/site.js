// Copy buttons, and counting the clicks that matter ([DIB-22](../../tickets/DIB-22.md)).
// Events go to Plausible only when the page was built with an analytics domain; otherwise
// `window.plausible` is undefined and nothing is sent anywhere.
(function () {
  function track(name) {
    if (typeof window.plausible === 'function') window.plausible(name);
  }

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text);
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); } finally { document.body.removeChild(ta); }
    return Promise.resolve();
  }

  document.querySelectorAll('button[data-copy]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var source = document.getElementById(btn.getAttribute('data-copy'));
      copyText(source.textContent.trim()).then(function () {
        btn.textContent = 'Copied';
        btn.classList.add('done');
        setTimeout(function () { btn.textContent = 'Copy'; btn.classList.remove('done'); }, 1600);
      });
      track(btn.getAttribute('data-event'));
    });
  });

  document.querySelectorAll('a[data-event]').forEach(function (a) {
    a.addEventListener('click', function () { track(a.getAttribute('data-event')); });
  });
})();
