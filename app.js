// ================================
// Gig Edge Rules v1.1
// ================================

const RULES = {
    minPayPerMile: 2.00,
    minGrossHourly: 30.00,
    maxMinutes: 60,
    maxDropOffs: 4
};

function analyzeOffer() {

    const pay = parseFloat(document.getElementById("pay").value);
    const miles = parseFloat(document.getElementById("miles").value);
    const minutes = parseFloat(document.getElementById("minutes").value);
    const drops = parseInt(document.getElementById("drops").value);

    if (
        isNaN(pay) ||
        isNaN(miles) ||
        isNaN(minutes) ||
        isNaN(drops) ||
        miles <= 0 ||
        minutes <= 0
    ) {
        alert("Please enter valid values.");
        return;
    }

    const payPerMile = pay / miles;
    const grossHourly = pay / (minutes / 60);

    let score = 0;
    let reasons = [];

    // -------------------------
    // Pay Per Mile (40 pts)
    // -------------------------

    if (payPerMile >= 3) {
        score += 40;
        reasons.push("✅ Excellent pay per mile");
    } else if (payPerMile >= 2.5) {
        score += 35;
        reasons.push("✅ Very good pay per mile");
    } else if (payPerMile >= 2) {
        score += 30;
        reasons.push("✅ Good pay per mile");
    } else if (payPerMile >= 1.5) {
        score += 20;
        reasons.push("⚠ Average pay per mile");
    } else {
        score += 10;
        reasons.push("❌ Low pay per mile");
    }

    // -------------------------
    // Gross Hourly (35 pts)
    // -------------------------

    if (grossHourly >= 40) {
        score += 35;
        reasons.push("✅ Excellent hourly earnings");
    } else if (grossHourly >= 30) {
        score += 30;
        reasons.push("✅ Strong hourly earnings");
    } else if (grossHourly >= 20) {
        score += 20;
        reasons.push("⚠ Average hourly earnings");
    } else {
        score += 10;
        reasons.push("❌ Low hourly earnings");
    }

    // -------------------------
    // Time (15 pts)
    // -------------------------

    if (minutes <= 60) {
        score += 15;
        reasons.push("✅ Efficient trip length");
    } else if (minutes <= 90) {
        score += 10;
        reasons.push("⚠ Longer trip");
    } else {
        score += 5;
        reasons.push("❌ Very long trip");
    }

    // -------------------------
    // Drop-Offs (10 pts)
    // -------------------------

    if (drops <= 2) {
        score += 10;
        reasons.push("✅ Low drop-off count");
    } else if (drops <= 4) {
        score += 8;
        reasons.push("✅ Reasonable drop-offs");
    } else if (drops <= 7) {
        score += 5;
        reasons.push("⚠ Many drop-offs");
    } else {
        score += 2;
        reasons.push("❌ Heavy drop-off load");
    }

    // -------------------------
    // Grade
    // -------------------------

    let grade;

    if (score >= 95)
        grade = "A+";
    else if (score >= 90)
        grade = "A";
    else if (score >= 80)
        grade = "B";
    else if (score >= 70)
        grade = "C";
    else if (score >= 60)
        grade = "D";
    else
        grade = "F";

    // -------------------------
    // Decision
    // -------------------------

    let decision;

    if (score >= 90)
        decision = "🟢 ACCEPT";
    else if (score >= 75)
        decision = "🟡 ACCEPT IF SLOW";
    else if (score >= 60)
        decision = "🟠 WAIT FOR BETTER";
    else
        decision = "🔴 DECLINE";

    // -------------------------
    // Display
    // -------------------------

    document.getElementById("ppm").innerHTML =
        "Pay Per Mile: $" + payPerMile.toFixed(2);

    document.getElementById("hourly").innerHTML =
        "Gross Hourly: $" + grossHourly.toFixed(2);

    document.getElementById("score").innerHTML =
        "Judah Score: " + score + "/100";

    document.getElementById("grade").innerHTML =
        "Grade: " + grade;

    document.getElementById("decision").innerHTML =
        decision;

    const list = document.getElementById("reasonList");

    list.innerHTML = "";

    reasons.forEach(function(reason) {

        const li = document.createElement("li");

        li.textContent = reason;

        list.appendChild(li);

    });

}