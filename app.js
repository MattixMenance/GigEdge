// Gig Edge Rapid Decision v2.3
// Rapid Mode adds optional pickup-mile protection.
// Full Analysis remains based on the proven v2.2 logic.

const RULES = {
  minPayPerMile: 2.00,
  minGrossHourly: 30.00,
  maxMinutes: 60,
  maxDropOffs: 4
};

const RAPID_DELAY = 350;

const fields = ["pay", "miles", "minutes", "drops"];
let rapidTimer = null;


// ============================================================
// RAPID DECISION MODE
// ============================================================

const rapidPay = document.getElementById("rapidPay");
const rapidMiles = document.getElementById("rapidMiles");
const pickupMiles = document.getElementById("pickupMiles");

function calculateRapid() {
  const pay = parseFloat(rapidPay.value);
  const miles = parseFloat(rapidMiles.value);

  const decisionEl = document.getElementById("rapidDecision");
  const rateEl = document.getElementById("rapidRate");
  const scoreEl = document.getElementById("rapidScore");
  const trueMilesEl = document.getElementById("trueMilesResult");

  decisionEl.textContent = "";
  rateEl.textContent = "";
  scoreEl.textContent = "";
  trueMilesEl.textContent = "";

  if (
    Number.isNaN(pay) ||
    Number.isNaN(miles) ||
    pay <= 0 ||
    miles <= 0
  ) {
    return;
  }

  const advertisedRate = pay / miles;

  let decision;
  let score;

  if (advertisedRate >= RULES.minPayPerMile) {
    decision = "🟢 TAKE";
    score = 100;
  } else if (advertisedRate >= 1.50) {
    decision = "🟡 BORDERLINE";
    score = 70;
  } else {
    decision = "🔴 DECLINE";
    score = 40;
  }

  decisionEl.textContent = decision;
  rateEl.textContent = "$" + advertisedRate.toFixed(2) + " advertised / mile";
  scoreEl.textContent = "Rapid Score: " + score + "/100";

  calculateTrueMiles(pay, miles);
}


function calculateTrueMiles(pay, offerMiles) {
  const pickup = parseFloat(pickupMiles.value);
  const trueMilesEl = document.getElementById("trueMilesResult");

  if (
    Number.isNaN(pickup) ||
    pickup < 0
  ) {
    trueMilesEl.innerHTML =
      "⚠️ <strong>Pickup miles not included.</strong><br>" +
      "Advertised rate is based on offer miles only.";
    return;
  }

  const totalMiles = offerMiles + pickup;
  const trueRate = pay / totalMiles;

  let decision;

  if (trueRate >= RULES.minPayPerMile) {
    decision =
      "🟢 <strong>ABOVE YOUR $" +
      RULES.minPayPerMile.toFixed(2) +
      " MINIMUM</strong>";
  } else {
    decision =
      "🔴 <strong>BELOW YOUR $" +
      RULES.minPayPerMile.toFixed(2) +
      " MINIMUM</strong>";
  }

  trueMilesEl.innerHTML =
    "<strong>Total Miles:</strong> " +
    totalMiles.toFixed(1) +
    "<br>" +
    "<strong>TRUE $/MILE:</strong> $" +
    trueRate.toFixed(2) +
    "<br>" +
    decision;
}


const rapidFields = ["rapidPay", "rapidMiles", "pickupMiles"];
let rapidAdvanceTimer = null;

function rapidFocusNext(currentId) {
  const index = rapidFields.indexOf(currentId);

  if (index === -1) return;

  if (index < rapidFields.length - 1) {
    const next = document.getElementById(rapidFields[index + 1]);

    next.focus();
    next.select();
  }
}

function scheduleRapidAdvance(input) {
  clearTimeout(rapidAdvanceTimer);

  if (!input.value.trim()) return;

  rapidAdvanceTimer = setTimeout(() => {
    if (input.value.trim()) {
      rapidFocusNext(input.id);
    }
  }, RAPID_DELAY);
}

rapidPay.addEventListener("input", () => {
  calculateRapid();
  scheduleRapidAdvance(rapidPay);
});

rapidMiles.addEventListener("input", () => {
  calculateRapid();
  scheduleRapidAdvance(rapidMiles);
});

pickupMiles.addEventListener("input", () => {
  const pay = parseFloat(rapidPay.value);
  const miles = parseFloat(rapidMiles.value);

  if (
    !Number.isNaN(pay) &&
    !Number.isNaN(miles) &&
    pay > 0 &&
    miles > 0
  ) {
    calculateTrueMiles(pay, miles);
  }
});

rapidFields.forEach(id => {
  const input = document.getElementById(id);

  input.addEventListener("keydown", event => {
    if (event.key === "Enter") {
      event.preventDefault();

      clearTimeout(rapidAdvanceTimer);

      if (input.value.trim()) {
        rapidFocusNext(input.id);
      }
    }
  });
});


// ============================================================
// FULL ANALYSIS — EXISTING v2.2 LOGIC
// ============================================================

function allFieldsFilled() {
  return fields.every(id => document.getElementById(id).value.trim() !== "");
}

function focusNext(currentId) {
  const index = fields.indexOf(currentId);
  if (index === -1) return;

  if (index < fields.length - 1) {
    const next = document.getElementById(fields[index + 1]);
    next.focus();
    next.select();
  } else if (allFieldsFilled()) {
    analyzeOffer();
  }
}

function scheduleFullAnalysisAdvance(input) {
  clearTimeout(rapidTimer);

  if (!input.value.trim()) return;

  rapidTimer = setTimeout(() => {
    if (input.value.trim()) focusNext(input.id);
  }, RAPID_DELAY);
}

fields.forEach(id => {
  const input = document.getElementById(id);

  input.addEventListener("input", () => scheduleFullAnalysisAdvance(input));

  input.addEventListener("keydown", event => {
    if (event.key === "Enter") {
      event.preventDefault();
      clearTimeout(rapidTimer);
      focusNext(input.id);
    }
  });
});


document.getElementById("analyzeBtn")
  .addEventListener("click", analyzeOffer);


// Full Analysis toggle

document.getElementById("fullAnalysisBtn")
  .addEventListener("click", () => {

    const fullAnalysis = document.getElementById("fullAnalysis");

    if (fullAnalysis.style.display === "none") {
      fullAnalysis.style.display = "grid";
      fullAnalysis.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    } else {
      fullAnalysis.style.display = "none";
    }
  });


function analyzeOffer() {
  clearTimeout(rapidTimer);

  const pay = parseFloat(document.getElementById("pay").value);
  const miles = parseFloat(document.getElementById("miles").value);
  const minutes = parseFloat(document.getElementById("minutes").value);
  const drops = parseInt(
    document.getElementById("drops").value,
    10
  );

  if (
    [pay, miles, minutes, drops].some(Number.isNaN) ||
    miles <= 0 ||
    minutes <= 0
  ) {
    return;
  }

  const payPerMile = pay / miles;
  const grossHourly = pay / (minutes / 60);

  let score = 0;

  if (payPerMile >= RULES.minPayPerMile) score += 40;
  else if (payPerMile >= 1.5) score += 25;
  else score += 10;

  if (grossHourly >= RULES.minGrossHourly) score += 35;
  else if (grossHourly >= 20) score += 20;
  else score += 10;

  if (minutes <= RULES.maxMinutes) score += 15;
  else if (minutes <= 90) score += 10;
  else score += 5;

  if (drops <= RULES.maxDropOffs) score += 10;
  else if (drops <= 7) score += 7;
  else score += 3;

  let decision;
  let reason;

  if (score >= 85) {
    decision = "🟢 ACCEPT";
    reason = "Excellent pay per mile and hourly earnings.";
  } else if (score >= 65) {
    decision = "🟡 BORDERLINE";
    reason = "Decent offer, but consider waiting if it's busy.";
  } else {
    decision = "🔴 DECLINE";
    reason = "Below your target thresholds.";
  }

  document.getElementById("ppm").textContent =
    "Pay Per Mile: $" + payPerMile.toFixed(2);

  document.getElementById("hourly").textContent =
    "Gross Hourly: $" + grossHourly.toFixed(2);

  document.getElementById("score").textContent =
    "Gig Score: " + score + "/100";

  document.getElementById("decision").textContent =
    "Grade: " + decision;

  document.getElementById("reason").textContent =
    reason;

  document.getElementById("quickDecisionText").textContent =
    decision;

  document.getElementById("quickScore").textContent =
    "Gig Score: " + score + "/100";

  document.getElementById("quickDecision").style.display =
    "block";
}

