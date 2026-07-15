/* Strong Mom Quotes: shared page script.
   Copy-to-clipboard, toast, and the account control (Sign in / avatar /
   Sign out) which appears in the header of every page. */
(function () {
  'use strict';

  var LS = { unlock: 'smq_unlocked', email: 'smq_email', dl: 'smq_downloads' };

  function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function lsDel(k) { try { localStorage.removeItem(k); } catch (e) {} }

  /* ---------- Toast ---------- */
  var toast = document.createElement('div');
  toast.className = 'toast';
  toast.setAttribute('role', 'status');
  document.body.appendChild(toast);
  var timer = null;
  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('show');
    if (timer) clearTimeout(timer);
    timer = setTimeout(function () { toast.classList.remove('show'); }, 2200);
  }
  window.smqToast = showToast;

  /* ---------- Copy quote ---------- */
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-copy]');
    if (!btn) return;
    var text = btn.getAttribute('data-copy');
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(
        function () { showToast('Quote copied'); },
        function () { fallbackCopy(text); }
      );
    } else {
      fallbackCopy(text);
    }
  });
  function fallbackCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); showToast('Quote copied'); }
    catch (err) { showToast('Press and hold the quote to copy'); }
    document.body.removeChild(ta);
  }

  /* ---------- Account control ----------
     Signed out: a Sign in button. This is also the way back in for a
     returning visitor on a new device or a cleared browser, so nobody
     has to burn three free uses just to reach the gate again.
     Signed in: an avatar with the first letter of their email. */
  var mount = document.getElementById('acct');
  if (!mount) return;

  function signedIn() { return lsGet(LS.unlock) === '1' && !!lsGet(LS.email); }

  function render() {
    mount.innerHTML = '';
    if (signedIn()) {
      var email = lsGet(LS.email) || '';
      var avatar = document.createElement('button');
      avatar.className = 'avatar';
      avatar.type = 'button';
      avatar.textContent = email.charAt(0).toUpperCase();
      avatar.setAttribute('aria-label', 'Account menu for ' + email);
      avatar.setAttribute('aria-expanded', 'false');
      avatar.setAttribute('aria-haspopup', 'true');

      var menu = document.createElement('div');
      menu.className = 'acct-menu';
      menu.innerHTML =
        '<p class="em"></p>' +
        '<p class="reassure">Every tool unlocked, free.</p>' +
        '<hr>' +
        '<button type="button" class="signout">Sign out</button>';
      menu.querySelector('.em').textContent = email;

      avatar.addEventListener('click', function (e) {
        e.stopPropagation();
        var open = menu.classList.toggle('open');
        avatar.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
      menu.addEventListener('click', function (e) { e.stopPropagation(); });
      menu.querySelector('.signout').addEventListener('click', function () {
        lsDel(LS.unlock);
        lsDel(LS.email);
        render();
        showToast('Signed out');
      });
      document.addEventListener('click', function () {
        menu.classList.remove('open');
        avatar.setAttribute('aria-expanded', 'false');
      });
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && menu.classList.contains('open')) {
          menu.classList.remove('open');
          avatar.setAttribute('aria-expanded', 'false');
          avatar.focus();
        }
      });

      mount.appendChild(avatar);
      mount.appendChild(menu);
    } else {
      var btn = document.createElement('button');
      btn.className = 'signin-btn';
      btn.type = 'button';
      btn.textContent = 'Sign in';
      btn.addEventListener('click', function () {
        /* The gate lives in the app, so send them there and open it. */
        if (document.getElementById('gateModal') && window.smqOpenGate) {
          window.smqOpenGate('signin');
        } else {
          location.href = '/app.html?signin=1';
        }
      });
      mount.appendChild(btn);
    }
  }
  window.smqRenderAccount = render;
  render();
})();
