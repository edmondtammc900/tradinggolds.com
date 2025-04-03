// API Keys - Replace these with your actual API keys
const NEWS_API_KEY = "3d7fb2fdb06d49b3aeebb560c983273a";

// DOM Elements
const goldPriceElement = document.getElementById("gold-price");
const priceChangeElement = document.getElementById("price-change");
const priceChart = document.getElementById("priceChart");
const tradeSizeInput = document.getElementById("trade-size");
const leverageInput = document.getElementById("leverage");
const accountCurrencySelect = document.getElementById("account-currency");
const marginRequiredElement = document.getElementById("margin-required");
const potentialPLElement = document.getElementById("potential-pl");
const burger = document.querySelector(".burger");
const navLinks = document.querySelector(".nav-links");

// Mobile Navigation
burger.addEventListener("click", () => {
  navLinks.classList.toggle("active");
  burger.classList.toggle("active");
  document.body.style.overflow = navLinks.classList.contains("active")
    ? "hidden"
    : "";
});

// Close mobile menu when clicking on a nav link
document.querySelectorAll(".nav-links a").forEach((link) => {
  link.addEventListener("click", () => {
    navLinks.classList.remove("active");
    burger.classList.remove("active");
    document.body.style.overflow = "";
  });
});

// Gold Price Chart
let priceChartInstance = null;
let lastPrice = null;

async function fetchGoldPrice() {
  try {
    const response = await fetch("https://api.gold-api.com/price/XAU");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching gold price:", error);
    goldPriceElement.textContent = "Price unavailable";
    priceChangeElement.textContent = "";
    return null;
  }
}

async function updateGoldPrice() {
  const data = await fetchGoldPrice();
  if (data && data.price) {
    const price = data.price;

    goldPriceElement.textContent = `$${price.toFixed(2)}`;

    // Calculate price change if we have a previous price
    if (lastPrice !== null) {
      const change = ((price - lastPrice) / lastPrice) * 100;
      priceChangeElement.textContent = `${
        change > 0 ? "+" : ""
      }${change.toFixed(2)}%`;
      priceChangeElement.style.color =
        change >= 0 ? "var(--success-color)" : "var(--error-color)";
    }

    lastPrice = price;

    // For historical data, we'll create a simple array of recent prices
    const historicalData = [];
    const now = new Date();
    for (let i = 0; i < 24; i++) {
      historicalData.push({
        timestamp: new Date(now.getTime() - (23 - i) * 3600000),
        price: price * (1 + (Math.random() - 0.5) * 0.01), // Simulated historical data
      });
    }
    updateChart(historicalData);
  }
}

function updateChart(historicalData) {
  const ctx = priceChart.getContext("2d");

  if (priceChartInstance) {
    priceChartInstance.destroy();
  }

  priceChartInstance = new Chart(ctx, {
    type: "line",
    data: {
      labels: historicalData.map((item) =>
        new Date(item.timestamp).toLocaleTimeString()
      ),
      datasets: [
        {
          label: "Gold Price (USD)",
          data: historicalData.map((item) => item.price),
          borderColor: "#FFD700",
          backgroundColor: "rgba(255, 215, 0, 0.2)",
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: "#FFD700",
          pointBorderColor: "#FFFFFF",
          pointRadius: 3,
          pointHoverRadius: 5,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: false,
          grid: {
            color: "rgba(255, 255, 255, 0.2)",
            drawBorder: true,
            borderColor: "rgba(255, 255, 255, 0.3)",
          },
          ticks: {
            color: "#FFFFFF",
            font: {
              size: 12,
            },
          },
        },
        x: {
          grid: {
            color: "rgba(255, 255, 255, 0.2)",
            drawBorder: true,
            borderColor: "rgba(255, 255, 255, 0.3)",
          },
          ticks: {
            color: "#FFFFFF",
            font: {
              size: 12,
            },
          },
        },
      },
      plugins: {
        legend: {
          labels: {
            color: "#FFFFFF",
            font: {
              size: 14,
              weight: "bold",
            },
          },
        },
        tooltip: {
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          titleColor: "#FFD700",
          bodyColor: "#FFFFFF",
          borderColor: "#FFD700",
          borderWidth: 1,
          padding: 10,
          displayColors: false,
        },
      },
    },
  });
}

// Trading Calculator
function calculateMargin() {
  const tradeSize = parseFloat(tradeSizeInput.value);
  const leverage = parseFloat(leverageInput.value);
  const accountCurrency = accountCurrencySelect.value;

  if (isNaN(tradeSize) || isNaN(leverage)) return;

  const currentPrice = parseFloat(
    goldPriceElement.textContent.replace("$", "")
  );
  if (isNaN(currentPrice)) {
    marginRequiredElement.textContent = "Price unavailable";
    potentialPLElement.textContent = "Price unavailable";
    return;
  }

  const marginRequired = (currentPrice * tradeSize) / leverage;

  marginRequiredElement.textContent = `${accountCurrency} ${marginRequired.toFixed(
    2
  )}`;

  // Calculate potential P/L for 1% move
  const potentialPL = currentPrice * tradeSize * 0.01;
  potentialPLElement.textContent = `${accountCurrency} ${potentialPL.toFixed(
    2
  )}`;
}

// Event Listeners
tradeSizeInput.addEventListener("input", calculateMargin);
leverageInput.addEventListener("input", calculateMargin);
accountCurrencySelect.addEventListener("change", calculateMargin);

// Initialize
document.addEventListener("DOMContentLoaded", async () => {
  // Initial price update
  await updateGoldPrice();

  // Update price every minute
  setInterval(updateGoldPrice, 60000);

  // Initial calculator update
  calculateMargin();
});
