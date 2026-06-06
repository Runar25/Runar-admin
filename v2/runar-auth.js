// ═══════════════════════════════════════════════════════
// RÚNAR · AUTH
// Authentication UI: banners, gates, modals, PWA install,
// sign-in, redeem, delete account.
// Depends on globals: lang, currentUser, userTier, userCredits,
//   activeAppTab, sb, FREE_TRIAL_LIMIT, FREE_REGISTERED_LIMIT,
//   DELAY_FOCUS, DELAY_SCROLL, DELAY_NAME_PROMPT, DELAY_RELOAD,
//   DELAY_ERROR_RESET
// Depends on functions: t(), getTrialCount(), getFreeMonthCount(),
//   updateQuestionGate(), showAppTab(), fetchUserProfile(),
//   setSt(), showToast(), showNamePrompt(), displayName()
// ═══════════════════════════════════════════════════════

// ─── ADMIN CHECK ─────────────────────────────────────────
// isAdmin() lives here (runar-auth.js) — auth logic, not config

// ── Delete Account ──────────────────────────────────────
function openDeleteModal() {
  const isIs = lang === 'is';
  const el = document.getElementById('delete-account-modal');
  if (!el) return;
  document.getElementById('dam-title').textContent   = t('dam_title');
  document.getElementById('dam-body').textContent    = t('dam_text');
  document.getElementById('dam-confirm').textContent = t('delete_btn');
  document.getElementById('dam-cancel').textContent  = t('cancel_btn');
  document.getElementById('dam-error').style.display = 'none';
  el.classList.add('open');
}
function closeDeleteModal() {
  const el = document.getElementById('delete-account-modal');
  if (el) el.classList.remove('open');
}
async function confirmDeleteAccount() {
  const confirmBtn = document.getElementById('dam-confirm');
  const errEl      = document.getElementById('dam-error');
  const isIs       = lang === 'is';

  confirmBtn.disabled    = true;
  confirmBtn.textContent = t('deleting_btn');
  errEl.style.display    = 'none';

  try {
    const session = await sb.auth.getSession();
    const token   = session.data.session?.access_token;
    if (!token) throw new Error('Not authenticated');

    const res  = await fetch('https://pmitxjvkeovijreepror.supabase.co/functions/v1/delete-account', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.error || 'Unknown error');

    // Success — sign out locally and reload
    await sb.auth.signOut();
    localStorage.clear();
    location.reload();

  } catch (e) {
    confirmBtn.disabled    = false;
    confirmBtn.textContent = t('delete_btn');
    errEl.textContent      = e.message;
    errEl.style.display    = 'block';
  }
}


// ─── AUTH ────────────────────────────────────────────────
// ── updateTabVisibility — tab show/hide logic ────────────────────────────────
function updateTabVisibility() {
  // Journal tab — always visible (Visitor sees gate inside)
  const journalTabBtn = document.getElementById('atab-journal');
  if (journalTabBtn) journalTabBtn.style.display = '';
  // Tree tab — visible only for logged-in users
  const treeTabBtn = document.getElementById('atab-tree');
  if (treeTabBtn) treeTabBtn.style.display = currentUser ? '' : 'none';
  // If logged out while on journal or tree tab — switch to reading
  if (!currentUser && (activeAppTab === 'journal' || activeAppTab === 'tree')) showAppTab('reading');
}

// ── updateAuthLabel — auth label + sign-in button ──────────────────────────────
function updateAuthLabel() {
  const label = document.getElementById('auth-user-label');
  const btn   = document.getElementById('auth-action-btn');
  if (currentUser) {
    label.style.display = 'block';
    label.textContent   = displayName();
    btn.style.display   = 'none';   // SIGN OUT lives in dropdown now
  } else {
    label.style.display = 'none';
    btn.style.display   = '';
    btn.textContent     = t('sign_in_btn');
    btn.classList.add('signin');
  }
}

// ── updateBanners — trial / free / credits banners + gates ───────────────────
function updateBanners() {
  const banner      = document.getElementById('trial-banner');
  const freeBanner  = document.getElementById('free-user-banner');
  const gate        = document.getElementById('auth-gate');
  const upgradeGate = document.getElementById('upgrade-gate');
  const content     = document.getElementById('reader-content');
  const creditsBanner = document.getElementById('credits-banner');

  if (currentUser) {
    // ── Logged in ──
    banner.style.display = 'none';
    gate.style.display   = 'none';

    // ── Rune Walker / Rune Keeper — unlimited ──
    if (userTier === 'standard' || userTier === 'premium') {
      freeBanner.style.display    = 'none';
      creditsBanner.style.display = 'none';
      upgradeGate.style.display   = 'none';
      content.style.display       = 'block';
      updateQuestionGate();
      return;
    }

    // ── Rune Seeker — FREE_REGISTERED_LIMIT free reading(s) + paid credits ──
    creditsBanner.style.display = 'none';
    const used      = getFreeMonthCount(currentUser.id);
    const remaining = Math.max(0, FREE_REGISTERED_LIMIT - used);
    const isIs      = lang === 'is';

    if (remaining > 0) {
      // Má volné měsíční sloty
      freeBanner.style.display = 'block';
      const cntEl = document.getElementById('free-user-count');
      if (cntEl) {
        cntEl.textContent = tp('rs_banner_counter', { casts: vn('cast', remaining, lang) });
        cntEl.className = 'tn-counter' + (remaining === 1 ? ' warn' : '');
      }
      const txtEl = document.getElementById('free-user-text');
      if (txtEl) txtEl.innerHTML = tp('rs_banner_desc', {
          casts_month: vn('cast', FREE_REGISTERED_LIMIT, lang),
          card:        vl('card', lang)
        });
      const btnEl = document.getElementById('tn-curious-btn');
      if (btnEl) { btnEl.textContent = t('gift_card_btn'); btnEl.style.display = ''; }
      upgradeGate.style.display = 'none';
      content.style.display     = 'block';

    } else if (userCredits > 0) {
      // Měsíční vyčerpány, ale má kredity → čtení pokračuje pomocí kreditů
      freeBanner.style.display = 'block';
      const cntEl = document.getElementById('free-user-count');
      if (cntEl) {
        cntEl.textContent = tp('rs_credits_counter', { units: vn('unit', userCredits, lang) });
        cntEl.className = 'tn-counter';
      }
      const txtEl = document.getElementById('free-user-text');
      if (txtEl) txtEl.innerHTML = tp('rs_credits_desc', { units: VOCAB.unit.en_pl });
      const btnEl2 = document.getElementById('tn-curious-btn');
      if (btnEl2) btnEl2.style.display = 'none'; // má kredity — nepotřebuje gift card button
      upgradeGate.style.display = 'none';
      content.style.display     = 'block';

    } else {
      // Monthly readings AND credits exhausted — show 0 in banner, form stays visible
      upgradeGate.style.display = 'none';
      freeBanner.style.display  = 'block';
      content.style.display     = 'block';
      const cntEl = document.getElementById('free-user-count');
      if (cntEl) {
        cntEl.textContent = tp('rs_banner_counter', { casts: vn('cast', 0, lang) });
        cntEl.className = 'tn-counter warn';
      }
      const txtEl = document.getElementById('free-user-text');
      if (txtEl) txtEl.innerHTML = tp(FREE_REGISTERED_LIMIT === 1 ? 'rs_exhausted_one' : 'rs_exhausted_many', {
          n:    FREE_REGISTERED_LIMIT,
          card: vl('card', lang)
        });
      const btnEl = document.getElementById('tn-curious-btn');
      if (btnEl) { btnEl.textContent = t('gift_card_btn'); btnEl.style.display = ''; }
    }
  } else {
    // ── Anonymous ──
    freeBanner.style.display  = 'none';
    upgradeGate.style.display = 'none';
    const remaining = Math.max(0, FREE_TRIAL_LIMIT - getTrialCount());
    if (remaining > 0) {
      // Build Visitor notice
      banner.style.display = 'block';
      const isIs = lang === 'is';
      const cntEl = document.getElementById('trial-count');
      if (cntEl) {
        cntEl.textContent = tp('visitor_counter', { casts: vn('cast', remaining, lang) });
        cntEl.className = 'tn-counter' + (remaining === 1 ? ' warn' : '');
      }
      const txtEl = document.getElementById('trial-text');
      if (txtEl) txtEl.innerHTML = t('visitor_desc');
      const btnEl = document.getElementById('tn-visitor-btn');
      if (btnEl) btnEl.textContent = t('become_rs_btn');
      gate.style.display    = 'none';
      content.style.display = 'block';
    } else {
      // Trial exhausted — show 0 in banner, form stays visible so visitor can sign up
      gate.style.display    = 'none';
      banner.style.display  = 'block';
      content.style.display = 'block';
      const isIs = lang === 'is';
      const cntEl = document.getElementById('trial-count');
      if (cntEl) {
        cntEl.textContent = tp('visitor_counter', { casts: vn('cast', 0, lang) });
        cntEl.className = 'tn-counter warn';
      }
      const txtEl = document.getElementById('trial-text');
      if (txtEl) txtEl.innerHTML = t('visitor_exhausted');
      const btnEl = document.getElementById('tn-visitor-btn');
      if (btnEl) btnEl.textContent = t('become_rs_btn');
    }
  }
  updateQuestionGate();
}

// ── updateAuthUI — coordinator ────────────────────────────────────────────────
function updateAuthUI() {
  updateTabVisibility();
  updateAuthLabel();
  updateBanners();
}

// ── SPECIFIC QUESTION GATE ────────────────────────────────
// Visible only for Rune Walker / Rune Keeper. Visitor + Rune Seeker see a teaser.
function updateQuestionGate() {
  const qSection = document.getElementById('q-section');
  const qTeaser  = document.getElementById('q-teaser');
  const qInput   = document.getElementById('r-question');
  if (!qSection || !qTeaser) return;
  const canAsk = (userTier === 'standard' || userTier === 'premium');
  qSection.style.display = canAsk ? 'block' : 'none';
  qTeaser.style.display  = 'none'; // hidden until Premium decision is made
  if (!canAsk && qInput) qInput.value = '';
}

function handleAuthBtn() {
  if (currentUser) sb.auth.signOut();
  else openAuthModal();
}

// ── PWA INSTALL ──────────────────────────────────────────
let _installPrompt = null;

function _isIOS()        { return /iphone|ipad|ipod/i.test(navigator.userAgent); }
function _isStandalone() { return window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true; }

window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  _installPrompt = e;
  _updateInstallBtn();
});
window.addEventListener('appinstalled', () => {
  _installPrompt = null;
  _updateInstallBtn();
});

function _updateInstallBtn() {
  const btn = document.getElementById('sp-install-btn');
  if (!btn) return;
  if (_isStandalone()) { btn.style.display = 'none'; return; }
  // Android/Chrome/Brave: show when prompt is ready
  // iOS Safari: always show (can't detect if installed)
  btn.style.display = (_installPrompt || _isIOS()) ? '' : 'none';
}

async function installPWA() {
  if (_installPrompt) {
    _installPrompt.prompt();
    const { outcome } = await _installPrompt.userChoice;
    if (outcome === 'accepted') { _installPrompt = null; _updateInstallBtn(); }
  } else {
    // iOS or no prompt available — show instructions
    const isIs = lang === 'is';
    const title = document.getElementById('install-modal-title');
    const body  = document.getElementById('install-modal-body');
    const btn   = document.getElementById('install-modal-btn');
    if (title) title.textContent = t('install_title');
    if (btn)   btn.textContent   = t('got_it_btn');
    if (body) {
      if (_isIOS()) {
        body.innerHTML = isIs
          ? 'Í Safari: ýttu á <strong>Deila</strong> táknið (□↑) neðst á skjánum, veldu síðan <strong>Bæta við heimaskjá</strong> og ýttu á <strong>Bæta við</strong>.'
          : 'In Safari: tap the <strong>Share</strong> button (□↑) at the bottom of your screen, then select <strong>Add to Home Screen</strong> and tap <strong>Add</strong>.';
      } else {
        body.innerHTML = isIs
          ? 'Í Chrome eða Brave: ýttu á <strong>⋮ valmynd</strong> efst til hægri og veldu <strong>Setja upp forrit</strong> eða <strong>Bæta við heimaskjá</strong>.'
          : 'In Chrome or Brave: tap the <strong>⋮ menu</strong> in the top right and select <strong>Install app</strong> or <strong>Add to Home Screen</strong>.';
      }
    }
    document.getElementById('install-modal').classList.add('open');
  }
}
function closeInstallModal() {
  document.getElementById('install-modal').classList.remove('open');
}

// Register service worker + auto-reload when a new SW takes over old stale content
if ('serviceWorker' in navigator) {
  // If the page is being served by an outdated SW, reload once the new one activates
  let _swRefreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (_swRefreshing) return;
    _swRefreshing = true;
    console.log('New service worker activated — reloading for fresh content.');
    window.location.reload();
  });

  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/Runar-admin/v2/sw.js', { scope: '/Runar-admin/v2/' })
      .then(() => _updateInstallBtn())
      .catch(e => console.warn('SW:', e));
  });
}


// ─── UPGRADE MODAL (stub — Rune Walker purchase not yet implemented) ─
// TODO: replace with real checkout flow when billing is ready
function openUpgradeModal() {
  // Until Rune Walker purchase flow exists, show info and link to site
  showToast(lang === 'is'
    ? 'Rune Walker - kemur bráðlega. Sjá agndofa.is'
    : 'Rune Walker subscription — coming soon. See agndofa.is');
}

function openAuthModal() {
  document.getElementById('auth-modal').classList.add('open');
  document.getElementById('auth-modal-body').style.display = 'block';
  document.getElementById('auth-modal-success').style.display = 'none';
  setSt('st-auth', '');
  setTimeout(() => document.getElementById('auth-email')?.focus(), DELAY_FOCUS);
}
function closeAuthModal() {
  document.getElementById('auth-modal').classList.remove('open');
}
document.addEventListener('click', e => {
  if (e.target.id === 'auth-modal')         closeAuthModal();
  if (e.target.id === 'lang-switch-modal')  cancelLangSwitch();
  if (e.target.id === 'delete-account-modal') closeDeleteModal();
});

function toggleRedeem() {
  const sec = document.getElementById('redeem-section');
  const visible = sec.style.display !== 'none';
  sec.style.display = visible ? 'none' : 'block';
  if (!visible) {
    setSt('st-redeem', '');
    setTimeout(() => document.getElementById('redeem-input')?.focus(), DELAY_SCROLL);
  }
}

async function redeemCode() {
  const input = document.getElementById('redeem-input');
  const code  = input?.value.trim().toUpperCase();
  if (!code) { setSt('st-redeem', 'Enter a code.', 'err'); return; }
  if (!currentUser) { openAuthModal(); return; }

  const btn = document.getElementById('redeem-btn');
  btn.disabled = true;
  setSt('st-redeem', lang === 'is' ? 'Athuga kóða…' : 'Verifying code…');

  try {
    const { data: { session } } = await sb.auth.getSession();
    const res  = await fetch(
      'https://pmitxjvkeovijreepror.supabase.co/functions/v1/redeem-code',
      {
        method: 'POST',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ code }),
      }
    );
    const data = await res.json();

    if (!res.ok || data.error) {
      const msgs = {
        'Code not found':        lang === 'is' ? 'Kóði fannst ekki.' : 'Code not found.',
        'Code already used':     lang === 'is' ? 'Þessi kóði hefur þegar verið notaður.' : 'This code has already been used.',
        'Code already redeemed': lang === 'is' ? 'Þessi kóði hefur þegar verið notaður.' : 'This code has already been used.',
        'Not authenticated':     lang === 'is' ? 'Skráðu þig inn fyrst.' : 'Please sign in first.',
        'Invalid session':       lang === 'is' ? 'Skráðu þig inn aftur.' : 'Please sign in again.',
        'rate_limited':          lang === 'is' ? 'Of margar tilraunir. Bíddu 15 mínútur.' : 'Too many attempts. Please wait 15 minutes.',
      };
      setSt('st-redeem', msgs[data.error] || data.error || 'Error.', 'err');
      btn.disabled = false;
      return;
    }

    // Success
    userCredits = data.new_balance;
    userTier    = 'rune_seeker'; // 'credits' je legacy alias — normalizujeme hned
    input.value = '';
    const runeMsg = data.rune_name ? ` · ${data.rune_name}` : '';
    setSt('st-redeem',
      tp('redeem_ok_msg', { units: vn('unit', data.credits_added, lang), rune: runeMsg, bal: data.new_balance }),
      'ok'
    );
    updateAuthUI();
    showToast(tp('redeem_toast_msg', { UNITS: vn('unit', data.credits_added, lang).toUpperCase() }));
    setTimeout(() => {
      document.getElementById('redeem-section').style.display = 'none';
      setSt('st-redeem', '');
    }, 4000);

  } catch(e) {
    setSt('st-redeem', e.message, 'err');
  }
  btn.disabled = false;
}

async function signInWithGoogle() {
  const cleanUrl = window.location.origin + window.location.pathname;
  const { error } = await sb.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: cleanUrl }
  });
  if (error) setSt('st-auth', error.message, 'err');
}

async function sendMagicLink() {
  const email = document.getElementById('auth-email').value.trim();
  if (!email) { setSt('st-auth', 'Please enter your email.', 'err'); return; }
  setSt('st-auth', 'Sending…');
  const cleanUrl = window.location.origin + window.location.pathname;
  const { error } = await sb.auth.signInWithOtp({ email, options: { emailRedirectTo: cleanUrl } });
  if (error) {
    const msg = (error.status === 429 || /rate/i.test(error.message))
      ? 'Too many requests — please wait a moment, or use Google sign-in above.'
      : error.message;
    setSt('st-auth', msg, 'err'); return;
  }
  document.getElementById('auth-modal-body').style.display = 'none';
  document.getElementById('auth-modal-success').style.display = 'block';
}

