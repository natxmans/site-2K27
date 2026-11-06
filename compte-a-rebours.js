/* Compte a rebours de la page « festival termine » : jours, heures, minutes, secondes jusqu'a la date
   donnee dans l'attribut data-cible (format ISO avec fuseau, ex. 2027-02-22T09:00:00+01:00).
   Quand la date est passee, le bloc affiche le texte de data-fin. Aucune donnee n'est envoyee nulle part. */
(function () {
  var zone = document.getElementById('compte-a-rebours');
  if (!zone) return;
  var cible = Date.parse(zone.getAttribute('data-cible'));
  if (isNaN(cible)) { zone.hidden = true; return; }
  var j = zone.querySelector('.cr-j'), h = zone.querySelector('.cr-h'), m = zone.querySelector('.cr-m'), s = zone.querySelector('.cr-s');
  var minuteur;
  function deux(n) { return n < 10 ? '0' + n : String(n); }
  function maj() {
    var reste = Math.floor((cible - Date.now()) / 1000);
    if (reste <= 0) {
      zone.textContent = zone.getAttribute('data-fin') || "C'est le grand jour !";
      zone.classList.add('fini');
      clearInterval(minuteur);
      return;
    }
    j.textContent = Math.floor(reste / 86400);
    h.textContent = deux(Math.floor(reste % 86400 / 3600));
    m.textContent = deux(Math.floor(reste % 3600 / 60));
    s.textContent = deux(reste % 60);
  }
  maj();
  minuteur = setInterval(maj, 1000);
})();
