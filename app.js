// Gig Edge Rapid Entry v2.2 — 350ms
const RULES = {
  minPayPerMile: 2.00,
  minGrossHourly: 30.00,
  maxMinutes: 60,
  maxDropOffs: 4
};

const RAPID_DELAY = 350;
const fields = ["pay", "miles", "minutes", "drops"];
let rapidTimer = null;

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

function scheduleRapidAdvance(input) {
  clearTimeout(rapidTimer);

  if (!input.value.trim()) return;

  rapidTimer = setTimeout(() => {
    if (input.value.trim()) focusNext(input.id);
  }, RAPID_DELAY);
}

fields.forEach(id => {
  const input = document.getElementById(id);

  input.addEventListener("input", () => scheduleRapidAdvance(input));

  input.addEventListener("keydown", event => {
    if (event.key === "Enter") {
      event.preventDefault();
      clearTimeout(rapidTimer);
      focusNext(input.id);
    }
  });
});

document.getElementById("analyzeBtn").addEventListener("click", analyzeOffer);

function analyzeOffer() {
  clearTimeout(rapidTimer);

  const pay = parseFloat(document.getElementById("pay").value);
  const miles = parseFloat(document.getElementById("miles").value);
  const minutes = parseFloat(document.getElementById("minutes").value);
  const drops = parseInt(document.getElementById("drops").value, 10);

  if ([pay, miles, minutes, drops].some(Number.isNaN) || miles <= 0 || minutes <= 0) {
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

  document.getElementById("ppm").textContent = "Pay Per Mile: $" + payPerMile.toFixed(2);
  document.getElementById("hourly").textContent = "Gross Hourly: $" + grossHourly.toFixed(2);
  document.getElementById("score").textContent = "Judah Score: " + score + "/100";
  document.getElementById("decision").textContent = "Grade: " + decision;
  document.getElementById("reason").textContent = reason;

  document.getElementById("quickDecisionText").textContent = decision;
  document.getElementById("quickScore").textContent = "Judah Score: " + score + "/100";
  document.getElementById("quickDecision").style.display = "block";
}
