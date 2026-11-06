/* Coffre de la page equipe : le contenu de la page est chiffre (AES-256-GCM, cle derivee du code equipe par
   PBKDF2-SHA256). Ce script demande le code, dechiffre dans le navigateur et affiche la page. Le code ne quitte
   jamais l'appareil. Option « rester connecte » : on garde la CLE derivee (pas le code) dans cet appareil. */
(function () {
  'use strict';
  var CLE_SOUVENIR = '2k27_equipe_cle_v2';
  var CLE_TEMP = '2k27_equipe_code_tmp';
  var zone = document.getElementById('coffre');
  if (!zone) return;

  function dec64(s) {
    var bin = atob(s), o = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) o[i] = bin.charCodeAt(i);
    return o;
  }
  function enc64(buf) {
    var o = new Uint8Array(buf), s = '';
    for (var i = 0; i < o.length; i++) s += String.fromCharCode(o[i]);
    return btoa(s);
  }
  var SEL = dec64(zone.getAttribute('data-sel'));
  var IV = dec64(zone.getAttribute('data-iv'));
  var CHIFFRE = dec64(zone.getAttribute('data-chiffre'));
  var TOURS = parseInt(zone.getAttribute('data-tours'), 10);

  var formulaire = document.getElementById('cf-formulaire');
  var champ = document.getElementById('cf-code');
  var souvenir = document.getElementById('cf-souvenir');
  var erreur = document.getElementById('cf-erreur');
  var bouton = document.getElementById('cf-bouton');

  function normaliser(c) { return c.replace(/[\s-]/g, '').toUpperCase(); }

  function deriver(code) {
    var enc = new TextEncoder();
    return crypto.subtle.importKey('raw', enc.encode(normaliser(code)), 'PBKDF2', false, ['deriveKey'])
      .then(function (k) {
        return crypto.subtle.deriveKey({ name: 'PBKDF2', salt: SEL, iterations: TOURS, hash: 'SHA-256' }, k,
          { name: 'AES-GCM', length: 256 }, true, ['decrypt']);
      });
  }

  function dechiffrer(cle) {
    return crypto.subtle.decrypt({ name: 'AES-GCM', iv: IV }, cle, CHIFFRE)
      .then(function (buf) { return new TextDecoder().decode(buf); });
  }

  function afficher(html) {
    var doc = new DOMParser().parseFromString(html, 'text/html');
    var scripts = [];
    Array.prototype.forEach.call(doc.querySelectorAll('script'), function (s) {
      if (s.getAttribute('src')) scripts.push(s.getAttribute('src'));
      s.parentNode.removeChild(s);
    });
    var coquille = document.getElementById('style-coffre');
    if (coquille) coquille.parentNode.removeChild(coquille);
    Array.prototype.forEach.call(doc.querySelectorAll('head style'), function (s) {
      var n = document.createElement('style');
      n.textContent = s.textContent;
      document.head.appendChild(n);
    });
    if (doc.title) document.title = doc.title;
    while (document.body.firstChild) document.body.removeChild(document.body.firstChild);
    while (doc.body.firstChild) document.body.appendChild(document.adoptNode(doc.body.firstChild));
    scripts.forEach(function (src) {
      var n = document.createElement('script');
      n.src = src;
      document.body.appendChild(n);
    });
  }

  function echec(message) {
    erreur.textContent = message;
    bouton.disabled = false;
    champ.value = '';
    champ.focus();
  }

  function essayerCode(code, retenir) {
    erreur.textContent = '';
    bouton.disabled = true;
    return deriver(code).then(function (cle) {
      return dechiffrer(cle).then(function (html) {
        if (retenir) {
          crypto.subtle.exportKey('raw', cle).then(function (raw) {
            try { localStorage.setItem(CLE_SOUVENIR, enc64(raw)); } catch (e) {}
          });
        }
        afficher(html);
      });
    }).catch(function () { echec('Code incorrect.'); });
  }

  function essayerCleRetenue(brut) {
    return crypto.subtle.importKey('raw', dec64(brut), { name: 'AES-GCM' }, false, ['decrypt'])
      .then(dechiffrer)
      .then(afficher)
      .catch(function () {
        try { localStorage.removeItem(CLE_SOUVENIR); } catch (e) {}
      });
  }

  if (!window.crypto || !crypto.subtle) {
    erreur.textContent = 'Ce navigateur ne peut pas ouvrir la page (ouvre-la en https).';
    bouton.disabled = true;
    return;
  }

  formulaire.addEventListener('submit', function (e) {
    e.preventDefault();
    if (champ.value) essayerCode(champ.value, souvenir.checked);
  });

  var tmp = null, retenue = null;
  try { tmp = sessionStorage.getItem(CLE_TEMP); sessionStorage.removeItem(CLE_TEMP); } catch (e) {}
  try { localStorage.removeItem('2k27_debloque'); retenue = localStorage.getItem(CLE_SOUVENIR); } catch (e) {}
  if (tmp) essayerCode(tmp, false);
  else if (retenue) essayerCleRetenue(retenue);
  else champ.focus();
})();
