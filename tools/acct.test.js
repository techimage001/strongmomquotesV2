/* Account control browser test (JSDOM). Run from /home/claude/smqjsdom
   so that node_modules never enters the delivered repo. */
const { JSDOM } = require('jsdom');
const fs = require('fs');
const SITE = '/home/claude/strongmomquotes';
const siteJs = fs.readFileSync(SITE + '/site.js', 'utf8');
let pass = 0, fail = 0;
const ok = (c, n) => { c ? (pass++, console.log('PASS ' + n)) : (fail++, console.log('FAIL ' + n)); };

function boot(storage) {
  const dom = new JSDOM(
    `<!doctype html><html><body>
       <header><nav><span class="acct" id="acct"></span></nav></header>
     </body></html>`,
    { runScripts: 'outside-only', url: 'https://strongmomquotes.com/' }
  );
  const store = Object.assign({}, storage);
  Object.defineProperty(dom.window, 'localStorage', {
    value: {
      getItem: k => (k in store ? store[k] : null),
      setItem: (k, v) => { store[k] = String(v); },
      removeItem: k => { delete store[k]; }
    },
    configurable: true
  });
  dom.window.eval(siteJs);
  return { dom, doc: dom.window.document, win: dom.window, store };
}

/* --- Signed out --- */
{
  const { doc } = boot({});
  const btn = doc.querySelector('#acct .signin-btn');
  ok(!!btn, 'signed out: Sign in button rendered');
  ok(btn && btn.textContent === 'Sign in', 'signed out: button says "Sign in"');
  ok(!doc.querySelector('#acct .avatar'), 'signed out: no avatar shown');
  ok(!/Signed up/i.test(doc.body.textContent), 'signed out: no permanent "Signed up" badge');
}

/* --- Signed in --- */
{
  const { doc, win } = boot({ smq_unlocked: '1', smq_email: 'sarah@example.com' });
  const av = doc.querySelector('#acct .avatar');
  ok(!!av, 'signed in: avatar rendered');
  ok(av && av.textContent === 'S', 'signed in: avatar shows first letter of the email');
  ok(!doc.querySelector('#acct .signin-btn'), 'signed in: Sign in button replaced');
  ok(av.getAttribute('aria-expanded') === 'false', 'signed in: avatar starts with aria-expanded=false');

  const menu = doc.querySelector('#acct .acct-menu');
  ok(menu && !menu.classList.contains('open'), 'dropdown: closed by default');

  av.dispatchEvent(new win.Event('click', { bubbles: true }));
  ok(menu.classList.contains('open'), 'dropdown: opens on avatar click');
  ok(av.getAttribute('aria-expanded') === 'true', 'dropdown: aria-expanded flips to true');
  ok(menu.querySelector('.em').textContent === 'sarah@example.com', 'dropdown: shows the email');
  ok(/Every tool unlocked, free\./.test(menu.textContent), 'dropdown: carries the reassurance line');
  ok(!!menu.querySelector('.signout'), 'dropdown: has a Sign out button');

  /* Escape closes */
  const esc = new win.KeyboardEvent('keydown', { key: 'Escape' });
  doc.dispatchEvent(esc);
  ok(!menu.classList.contains('open'), 'dropdown: Escape closes it');
  ok(av.getAttribute('aria-expanded') === 'false', 'dropdown: aria-expanded returns to false');
}

/* --- Sign out clears the unlock and restores the button --- */
{
  const { doc, win, store } = boot({ smq_unlocked: '1', smq_email: 'sarah@example.com' });
  doc.querySelector('#acct .avatar').dispatchEvent(new win.Event('click', { bubbles: true }));
  doc.querySelector('#acct .signout').dispatchEvent(new win.Event('click', { bubbles: true }));
  ok(store.smq_unlocked === undefined, 'sign out: unlock flag cleared from storage');
  ok(store.smq_email === undefined, 'sign out: email cleared from storage');
  ok(!!doc.querySelector('#acct .signin-btn'), 'sign out: Sign in button restored');
  ok(!doc.querySelector('#acct .avatar'), 'sign out: avatar removed');
  ok(/Signed out/.test(doc.querySelector('.toast').textContent), 'sign out: confirms with a toast');
}

/* --- A signed-out visitor on a new device can get back in without burning uses --- */
{
  /* JSDOM forbids redefining window.location, so assert on the wired behaviour:
     the Sign in button either opens the gate in sign-in mode on the app page,
     or navigates to the app with ?signin=1 from any other page. */
  ok(/smqOpenGate\('signin'\)/.test(siteJs), 'return path: Sign in opens the gate in sign-in mode when the gate is on the page');
  ok(/\/app\.html\?signin=1/.test(siteJs), 'return path: Sign in navigates to the app in sign-in mode from content pages');
  const appHtml = fs.readFileSync(SITE + '/app.html', 'utf8');
  ok(/params\.get\('signin'\)==='1'/.test(appHtml), 'return path: the app honours ?signin=1 and shows the gate');
  ok(/window\.smqOpenGate=showGate/.test(appHtml), 'return path: the app exposes smqOpenGate for the header button');
  ok(/mode:gateMode/.test(appHtml) && /'signin'/.test(appHtml), 'return path: sign-in posts mode=signin, no free uses consumed');
}

console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
