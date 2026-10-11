
(function () {
  var L = ['fr', 'en', 'es', 'pt'], l = 'en';
  try { l = localStorage.getItem('atlas-lang') || 'en'; } catch (e) {}
  var q = /[?&]lang=([a-z]{2})/.exec(location.search); if (q && L.indexOf(q[1]) >= 0) { l = q[1]; try { localStorage.setItem('atlas-lang', l); } catch (e) {} }
  if (L.indexOf(l) < 0) l = 'en';
  window.LANG = l; document.documentElement.lang = l;
  if (l !== 'fr') document.write('<script src="i18n/' + l + '.js"><\/script>');
})();
