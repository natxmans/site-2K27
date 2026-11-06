/* Acces equipe : Ctrl+Maj+Q ouvre la fenetre du code ; on arrive ensuite sur la page de l'equipe, dont le contenu
   est CHIFFRE (le vrai controle du code se fait la-bas, par dechiffrement : voir coffre-equipe.js). Ici, aucun code
   ni empreinte de code : rien a decouvrir en lisant ce fichier. Si l'appareil a deja ete retenu sur la page
   equipe (option « rester connecte »), Ctrl+Maj+Q mene directement a la page. */
(function () {
  'use strict';
  var CLE_SOUVENIR = '2k27_equipe_cle_v2';
  var CLE_TEMP = '2k27_equipe_code_tmp';
  var ici = (document.currentScript && document.currentScript.src) || 'https://natxmans.github.io/site-2K27/acces-equipe.js';
  var PAGE = new URL('espace-equipe.html', ici).href;
  var fond = null, champ = null;

  function construire() {
    var style = document.createElement('style');
    style.textContent =
      '.acces-equipe{position:fixed;inset:0;z-index:9999;display:none;align-items:center;justify-content:center;background:rgba(0,0,0,.72);padding:20px}' +
      '.acces-equipe-boite{background:#14141f;border:1px solid rgba(34,232,255,.5);border-radius:18px;padding:24px 26px;max-width:340px;width:100%;text-align:center;color:#e8e8f5;font-family:Rajdhani,sans-serif}' +
      '.acces-equipe-boite h2{font-family:Orbitron,sans-serif;font-size:1.05rem;margin:0 0 6px}' +
      '.acces-equipe-boite p{color:#9494b0;font-size:.9rem;margin:0 0 14px}' +
      '.acces-equipe-boite input{width:100%;font-size:1.1rem;padding:10px 12px;border-radius:10px;border:1px solid rgba(255,255,255,.2);background:#0a0a14;color:#fff;text-align:center;margin-bottom:14px}' +
      '.acces-equipe-boutons{display:flex;gap:10px;justify-content:center}' +
      '.acces-equipe-boutons button{padding:9px 20px;border-radius:24px;border:1px solid rgba(255,255,255,.25);background:transparent;color:#e8e8f5;font-weight:700;cursor:pointer}' +
      '.acces-equipe-boutons button.principal{background:linear-gradient(90deg,#b026ff,#22e8ff);color:#06060c;border:none}';
    document.head.appendChild(style);

    fond = document.createElement('div');
    fond.className = 'acces-equipe';
    fond.setAttribute('role', 'dialog');
    fond.setAttribute('aria-modal', 'true');
    fond.setAttribute('aria-labelledby', 'acces-equipe-titre');
    fond.innerHTML =
      '<div class="acces-equipe-boite"><h2 id="acces-equipe-titre">Accès équipe</h2>' +
      '<p>Entre le code équipe.</p>' +
      '<input type="password" autocomplete="off" autocapitalize="characters" spellcheck="false" aria-label="Code équipe">' +
      '<div class="acces-equipe-boutons"><button type="button" class="annuler">Annuler</button><button type="button" class="principal valider">Entrer</button></div></div>';
    document.body.appendChild(fond);
    champ = fond.querySelector('input');
    fond.querySelector('.annuler').addEventListener('click', fermer);
    fond.querySelector('.valider').addEventListener('click', valider);
    champ.addEventListener('keydown', function (e) { if (e.key === 'Enter') valider(); });
    fond.addEventListener('click', function (e) { if (e.target === fond) fermer(); });
  }

  function fermer() { if (fond) fond.style.display = 'none'; }

  function valider() {
    if (!champ.value) return;
    try { sessionStorage.setItem(CLE_TEMP, champ.value); } catch (e) {}
    location.href = PAGE;
  }

  function ouvrir() {
    try { if (localStorage.getItem(CLE_SOUVENIR)) { location.href = PAGE; return; } } catch (e) {}
    if (!fond) construire();
    champ.value = '';
    fond.style.display = 'flex';
    champ.focus();
  }

  try { localStorage.removeItem('2k27_debloque'); } catch (e) {}
  document.addEventListener('keydown', function (e) {
    if (e.ctrlKey && e.shiftKey && (e.key === 'Q' || e.key === 'q')) {
      e.preventDefault();
      ouvrir();
    } else if (e.key === 'Escape') {
      fermer();
    }
  });
})();
