// ================================
// Gig Edge Rules v1.0
// ================================

const RULES = {
    minPayPerMile: 2.00,
    minGrossHourly: 30.00,
    maxMinutes: 60,
    maxDropOffs: 4
};function analyzeOffer() {

    let pay = parseFloat(document.getElementById("pay").value);
    let miles = parseFloat(document.getElementById("miles").value);
    let minutes = parseFloat(document.getElementById("minutes").value);
    let drops = parseInt(document.getElementById("drops").value);

    if (isNaN(pay) || isNaN(miles) || isNaN(minutes) || isNaN(drops)) {
        alert("Please fill in all fields.");
        return;
    }

    let payPerMile = pay / miles;
    let grossHourly = pay / (minutes / 60);

    let score = 0;

    // Pay per mile (40 points)
   if (payPerMile >= RULES.minPayPerMile)
        score += 40;
    else if (payPerMile >= 1.5)
        score += 25;
    else
        score += 10;

    // Gross hourly (35 points)
if (grossHourly >= RULES.minGrossHourly)
        score += 35;
    else if (grossHourly >= 20)
        score += 20;
    else
        score += 10;

    // Time (15 points)
  if (minutes <= RULES.maxMinutes)
        score += 15;
    else if (minutes <= 90)
        score += 10;
    else
        score += 5;

    // Drop-offs (10 points)
   if (drops <= RULES.maxDropOffs)
        score += 10;
    else if (drops <= 7)
        score += 7;
    else
        score += 3;

    let decision = "";
    let reason = "";

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

    document.getElementById("ppm").innerHTML =
        "Pay Per Mile: $" + payPerMile.toFixed(2);

    document.getElementById("hourly").innerHTML =
        "Gross Hourly: $" + grossHourly.toFixed(2);

    document.getElementById("score").innerHTML =
        "Judah Score: " + score + "/100";

    document.getElementById("decision").innerHTML = decision;

    document.getElementById("reason").innerHTML = reason;
}