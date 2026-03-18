/* ═══════════════════════════════════════════════════════════════════
   STATE
═══════════════════════════════════════════════════════════════════ */
const state = {
  currentStep: 1,
  isYearly: false,
  selectedPlan: 'arcade',
  // add-ons keyed by id
  addons: { online: true, storage: true, profile: false }
};

/* Plan data */
const plans = {
  arcade:   { name: 'Arcade',   monthly: 9,  yearly: 90  },
  advanced: { name: 'Advanced', monthly: 12, yearly: 120 },
  pro:      { name: 'Pro',      monthly: 15, yearly: 150 }
};

/* Add-on data */
const addonData = {
  online:  { label: 'Online service', monthly: 1,  yearly: 10 },
  storage: { label: 'Larger storage', monthly: 2,  yearly: 20 },
  profile: { label: 'Customizable Profile', monthly: 2, yearly: 20 }
};

/* ═══════════════════════════════════════════════════════════════════
   DOM HELPERS
═══════════════════════════════════════════════════════════════════ */
const $ = id => document.getElementById(id);
const qs = sel => document.querySelector(sel);

/* ═══════════════════════════════════════════════════════════════════
   STEP NAVIGATION
═══════════════════════════════════════════════════════════════════ */
function goTo(step) {
  // Hide all panels
  document.querySelectorAll('.step-panel, .thankyou-panel').forEach(p => p.classList.remove('visible'));

  if (step === 'thankyou') {
    $('thankyou').classList.add('visible');
    // Update sidebar – all complete
    document.querySelectorAll('.step-item').forEach(li => li.classList.remove('active'));
  } else {
    $(`step${step}`).classList.add('visible');
    state.currentStep = step;
    updateSidebar(step);
  }
}

function updateSidebar(activeStep) {
  document.querySelectorAll('.step-item').forEach(li => {
    li.classList.toggle('active', parseInt(li.dataset.step) === activeStep);
  });
}

/* ═══════════════════════════════════════════════════════════════════
   VALIDATION
═══════════════════════════════════════════════════════════════════ */
function validateStep1() {
  let valid = true;

  const name = $('name').value.trim();
  const email = $('email').value.trim();
  const phone = $('phone').value.trim();

  // Name
  if (!name) {
    showError('name', 'This field is required'); valid = false;
  } else clearError('name');

  // Email
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) {
    showError('email', 'This field is required'); valid = false;
  } else if (!emailRe.test(email)) {
    showError('email', 'Please enter a valid email'); valid = false;
  } else clearError('email');

  // Phone
  if (!phone) {
    showError('phone', 'This field is required'); valid = false;
  } else clearError('phone');

  return valid;
}

function showError(field, msg) {
  $(`${field}`).classList.add('error');
  const errEl = $(`${field}-error`);
  errEl.textContent = msg;
  errEl.classList.add('visible');
}
function clearError(field) {
  $(`${field}`).classList.remove('error');
  $(`${field}-error`).classList.remove('visible');
}

/* Live validation: clear error on input */
['name', 'email', 'phone'].forEach(f => {
  $(f).addEventListener('input', () => clearError(f));
});

/* ═══════════════════════════════════════════════════════════════════
   PLAN SELECTION
═══════════════════════════════════════════════════════════════════ */
document.querySelectorAll('.plan-card').forEach(card => {
  card.addEventListener('click', () => selectPlan(card.dataset.plan));
  card.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectPlan(card.dataset.plan); }
  });
});

function selectPlan(plan) {
  state.selectedPlan = plan;
  document.querySelectorAll('.plan-card').forEach(c => {
    const active = c.dataset.plan === plan;
    c.classList.toggle('selected', active);
    c.setAttribute('aria-checked', active);
  });
}

/* ═══════════════════════════════════════════════════════════════════
   BILLING TOGGLE
═══════════════════════════════════════════════════════════════════ */
const billingToggle = $('billingToggle');

function setYearly(yearly) {
  state.isYearly = yearly;
  billingToggle.classList.toggle('yearly', yearly);
  billingToggle.setAttribute('aria-checked', yearly);
  $('label-monthly').classList.toggle('active', !yearly);
  $('label-yearly').classList.toggle('active', yearly);
  updatePlanPrices();
  updateAddonPrices();
}

function updatePlanPrices() {
  const suffix = state.isYearly ? '/yr' : '/mo';
  Object.keys(plans).forEach(key => {
    const price = state.isYearly ? plans[key].yearly : plans[key].monthly;
    $(`${key}-price`).textContent = `$${price}${suffix}`;
    const badge = $(`${key}-badge`);
    badge.style.display = state.isYearly ? '' : 'none';
  });
}

function updateAddonPrices() {
  Object.keys(addonData).forEach(key => {
    const price = state.isYearly ? addonData[key].yearly : addonData[key].monthly;
    const suffix = state.isYearly ? '/yr' : '/mo';
    $(`addon-${key}-price`).textContent = `+$${price}${suffix}`;
  });
}

billingToggle.addEventListener('click', () => setYearly(!state.isYearly));
billingToggle.addEventListener('keydown', e => {
  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setYearly(!state.isYearly); }
});

/* ═══════════════════════════════════════════════════════════════════
   ADD-ONS
═══════════════════════════════════════════════════════════════════ */
document.querySelectorAll('.addon-item').forEach(item => {
  item.addEventListener('click', () => toggleAddon(item));
  item.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleAddon(item); }
  });
});

function toggleAddon(item) {
  const key = item.dataset.addon;
  state.addons[key] = !state.addons[key];
  item.classList.toggle('checked', state.addons[key]);
  item.setAttribute('aria-checked', state.addons[key]);
}

/* ═══════════════════════════════════════════════════════════════════
   SUMMARY BUILD
═══════════════════════════════════════════════════════════════════ */
function buildSummary() {
  const plan = plans[state.selectedPlan];
  const yearly = state.isYearly;
  const suffix = yearly ? '/yr' : '/mo';
  const planPrice = yearly ? plan.yearly : plan.monthly;

  // Plan header
  $('summary-plan-name').textContent = `${plan.name} (${yearly ? 'Yearly' : 'Monthly'})`;
  $('summary-plan-price').textContent = `$${planPrice}${suffix}`;
  $('summary-total-label').textContent = `Total (per ${yearly ? 'year' : 'month'})`;

  // Addons
  let addonTotal = 0;
  const addonHtml = Object.keys(addonData)
    .filter(k => state.addons[k])
    .map(k => {
      const price = yearly ? addonData[k].yearly : addonData[k].monthly;
      addonTotal += price;
      return `
        <div class="summary-addon-row">
          <span class="summary-addon-label">${addonData[k].label}</span>
          <span class="summary-addon-price">+$${price}${suffix}</span>
        </div>`;
    }).join('');

  $('summary-addons').innerHTML = addonHtml;

  // Total
  const total = planPrice + addonTotal;
  const totalLabel = yearly ? `$${total}${suffix}` : `+$${total}${suffix}`;
  $('summary-total-price').textContent = totalLabel;
}

/* "Change" link in summary → go back to step 2 */
$('summary-change').addEventListener('click', e => {
  e.preventDefault();
  goTo(2);
});

/* ═══════════════════════════════════════════════════════════════════
   BUTTON WIRING
═══════════════════════════════════════════════════════════════════ */
$('next1').addEventListener('click', () => {
  if (validateStep1()) goTo(2);
});

$('back2').addEventListener('click', () => goTo(1));
$('next2').addEventListener('click', () => goTo(3));

$('back3').addEventListener('click', () => goTo(2));
$('next3').addEventListener('click', () => goTo(4));

$('back4').addEventListener('click', () => goTo(3));
$('confirm').addEventListener('click', () => {
  buildSummary(); // final sanity pass
  goTo('thankyou');
});

/* Build summary whenever step 4 is entered */
document.querySelectorAll('#next3').forEach(btn => {
  btn.addEventListener('click', () => buildSummary());
});
// also cover direct calls
const origGoTo = goTo;
// patch: rebuild summary whenever we navigate to step 4
window._goTo = function(step) {
  if (step === 4) buildSummary();
  origGoTo(step);
};

// Patch all back/next to use _goTo
['back2','back3','back4'].forEach((id, i) => {
  $(id).addEventListener('click', () => {}); // already wired above
});

// Re-wire more carefully to ensure summary builds on step 4
['next3'].forEach(id => $(id).addEventListener('click', buildSummary));

/* ═══════════════════════════════════════════════════════════════════
   INIT
═══════════════════════════════════════════════════════════════════ */
updatePlanPrices();
updateAddonPrices();
goTo(1);