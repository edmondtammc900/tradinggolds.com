// API Keys - Replace these with your actual API keys
const NEWS_API_KEY = "3d7fb2fdb06d49b3aeebb560c983273a";

// DOM Elements
const goldPriceElement = document.getElementById("gold-price");
const priceChangeElement = document.getElementById("price-change");
const priceChart = document.getElementById("priceChart");
const burger = document.querySelector(".burger");
const navLinks = document.querySelector(".nav-links");

// CFD Calculator Elements
const positionType = document.getElementById("position-type");
const entryPrice = document.getElementById("entry-price");
const exitPrice = document.getElementById("exit-price");
const marginRequirement = document.getElementById("margin-requirement");
const leverageRatio = document.getElementById("leverage-ratio");
const calculateProfitBtn = document.getElementById("calculate-profit");
const profitResult = document.getElementById("profit-result");

const positionSize = document.getElementById("position-size");
const marginLeverage = document.getElementById("margin-leverage");
const calculateMarginBtn = document.getElementById("calculate-margin");
const marginResult = document.getElementById("margin-result");

// Tab Elements
const tabButtons = document.querySelectorAll(".tab-btn");
const calculators = document.querySelectorAll(".calculator");

// Tab Switching
tabButtons.forEach((button) => {
  button.addEventListener("click", () => {
    // Remove active class from all buttons and calculators
    tabButtons.forEach((btn) => btn.classList.remove("active"));
    calculators.forEach((calc) => calc.classList.remove("active"));

    // Add active class to clicked button and corresponding calculator
    button.classList.add("active");
    const tabId = button.getAttribute("data-tab");
    document.getElementById(`${tabId}-calculator`).classList.add("active");
  });
});

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

// CFD Profit Calculator
function calculateProfit() {
  const isLong = positionType.value === "long";
  const entry = parseFloat(entryPrice.value);
  const exit = parseFloat(exitPrice.value);
  const margin = parseFloat(marginRequirement.value);
  const leverage = parseFloat(leverageRatio.value);

  if (isNaN(entry) || isNaN(exit) || isNaN(margin) || isNaN(leverage)) {
    profitResult.textContent = "Please enter valid numbers";
    return;
  }

  const priceDifference = isLong ? exit - entry : entry - exit;
  const profit = (priceDifference * margin * leverage) / entry;
  profitResult.textContent = `$${profit.toFixed(2)}`;
  profitResult.style.color =
    profit >= 0 ? "var(--success-color)" : "var(--error-color)";
}

// CFD Margin Calculator
function calculateMargin() {
  const size = parseFloat(positionSize.value);
  const leverage = parseFloat(marginLeverage.value);

  if (isNaN(size) || isNaN(leverage)) {
    marginResult.textContent = "Please enter valid numbers";
    return;
  }

  const margin = size / leverage;
  marginResult.textContent = `$${margin.toFixed(2)}`;
}

// Event Listeners for CFD Calculators
calculateProfitBtn.addEventListener("click", calculateProfit);
calculateMarginBtn.addEventListener("click", calculateMargin);

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

// Initialize price updates with lazy loading
document.addEventListener("DOMContentLoaded", async () => {
  // Create Intersection Observer for lazy loading
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Start price updates when chart is visible
          updateGoldPrice();
          setInterval(updateGoldPrice, 60000);
          observer.unobserve(entry.target);
        }
      });
    },
    {
      rootMargin: "50px 0px",
      threshold: 0.1,
    }
  );

  // Observe the chart container
  const chartContainer = document.querySelector(".chart-container");
  if (chartContainer) {
    observer.observe(chartContainer);
  }
});
