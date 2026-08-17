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
// ============================================================
// PICKUP MILES — AUTO / MANUAL ROUTING TEST
// ============================================================

const autoPickupBtn = document.getElementById("autoPickupBtn");
const manualPickupBtn = document.getElementById("manualPickupBtn");
const autoPickupPanel = document.getElementById("autoPickupPanel");
const manualPickupPanel = document.getElementById("manualPickupPanel");
const pickupAddress = document.getElementById("pickupAddress");
const getPickupMilesBtn = document.getElementById("getPickupMilesBtn");
const pickupAutoStatus = document.getElementById("pickupAutoStatus");

autoPickupBtn.addEventListener("click", () => {
  autoPickupPanel.style.display = "block";
  manualPickupPanel.style.display = "none";
  pickupAutoStatus.textContent = "";
});

manualPickupBtn.addEventListener("click", () => {
  autoPickupPanel.style.display = "none";
  manualPickupPanel.style.display = "block";
  pickupAutoStatus.textContent = "";
  pickupMiles.focus();
});

async function geocodePickupAddress(address) {
  const url =
    "https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=" +
    encodeURIComponent(address);

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Address lookup failed.");
  }

  const results = await response.json();

  if (!results.length) {
    throw new Error("Pickup address not found.");
  }

  return {
    latitude: parseFloat(results[0].lat),
    longitude: parseFloat(results[0].lon)
  };
}

async function getDrivingDistance(
  startLatitude,
  startLongitude,
  endLatitude,
  endLongitude
) {
  const coordinates =
    `${startLongitude},${startLatitude};` +
    `${endLongitude},${endLatitude}`;

  const url =
    "https://router.project-osrm.org/route/v1/driving/" +
    coordinates +
    "?overview=false";

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Routing request failed.");
  }

  const data = await response.json();

  if (data.code !== "Ok" || !data.routes || !data.routes.length) {
    throw new Error("No driving route found.");
  }

  return data.routes[0].distance / 1609.344;
}

getPickupMilesBtn.addEventListener("click", () => {
  const address = pickupAddress.value.trim();

  if (!address) {
    pickupAutoStatus.textContent =
      "⚠️ Enter the pickup address first.";
    pickupAddress.focus();
    return;
  }

  if (!navigator.geolocation) {
    pickupAutoStatus.textContent =
      "⚠️ Location services are unavailable.";
    return;
  }

  pickupAutoStatus.textContent =
    "📍 Getting current location...";

  getPickupMilesBtn.disabled = true;

  navigator.geolocation.getCurrentPosition(
    async position => {
      try {
        const startLatitude = position.coords.latitude;
        const startLongitude = position.coords.longitude;

        pickupAutoStatus.textContent =
          "🔎 Finding pickup location...";

        const destination =
          await geocodePickupAddress(address);

        pickupAutoStatus.textContent =
          "🛣️ Calculating driving distance...";

        const distance = await getDrivingDistance(
          startLatitude,
          startLongitude,
          destination.latitude,
          destination.longitude
        );

        pickupMiles.value = distance.toFixed(1);

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

        pickupAutoStatus.textContent =
          "✅ Pickup distance: " +
          distance.toFixed(1) +
          " miles";

      } catch (error) {
        console.error("Gig Edge pickup routing error:", error);

        pickupAutoStatus.textContent =
          "⚠️ " + error.message;
      } finally {
        getPickupMilesBtn.disabled = false;
      }
    },

    error => {
      getPickupMilesBtn.disabled = false;

      if (error.code === 1) {
        pickupAutoStatus.textContent =
          "⚠️ Location permission was denied.";
      } else if (error.code === 2) {
        pickupAutoStatus.textContent =
          "⚠️ Your location could not be determined.";
      } else if (error.code === 3) {
        pickupAutoStatus.textContent =
          "⚠️ Location request timed out.";
      } else {
        pickupAutoStatus.textContent =
          "⚠️ Unable to get your location.";
      }
    },

    {
      enableHighAccuracy: false,
      timeout: 10000,
      maximumAge: 30000
    }
  );
});