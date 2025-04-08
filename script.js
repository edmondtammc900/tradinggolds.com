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
let isFirstLoad = true;

// 存儲真實的價格歷史
let priceHistory = [];

async function fetchGoldPrice() {
  try {
    goldPriceElement.textContent = "Loading...";
    priceChangeElement.textContent = "";

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

async function fetchHistoricalData(currentPrice) {
  try {
    // 只返回當前價格點
    return [
      {
        timestamp: new Date(),
        price: currentPrice,
      },
    ];
  } catch (error) {
    console.error("Error generating historical data:", error);
    return null;
  }
}

async function updateGoldPrice() {
  const data = await fetchGoldPrice();
  if (data && data.price) {
    const price = parseFloat(data.price);

    goldPriceElement.textContent = `$${price.toFixed(2)}`;

    if (lastPrice !== null) {
      const previousPrice = parseFloat(lastPrice);

      // 計算變動百分比
      const change = ((price - previousPrice) / previousPrice) * 100;

      // 在控制台輸出詳細的計算過程
      console.log("Detailed Price Change Calculation:", {
        currentPrice: price,
        previousPrice: previousPrice,
        difference: price - previousPrice,
        changePercentage: change,
        rawCalculation: `((${price} - ${previousPrice}) / ${previousPrice}) * 100 = ${change}`,
      });

      // 更新顯示
      priceChangeElement.textContent = `${
        change > 0 ? "+" : ""
      }${change.toFixed(3)}%`;
      priceChangeElement.style.color =
        change >= 0 ? "var(--success-color)" : "var(--error-color)";
    }

    lastPrice = price;

    // 更新圖表數據
    const historicalData = await fetchHistoricalData(price);
    if (historicalData) {
      updateChart(historicalData);
    }
  }
}

function updateChart(historicalData) {
  if (!historicalData) return;

  // 將新數據點添加到歷史記錄
  priceHistory.push(historicalData[0]);

  // 只保留最近24小時的數據
  const oneDayAgo = new Date().getTime() - 24 * 60 * 60 * 1000;
  priceHistory = priceHistory.filter(
    (point) => point.timestamp.getTime() > oneDayAgo
  );

  const ctx = priceChart.getContext("2d");

  if (priceChartInstance) {
    priceChartInstance.destroy();
  }

  const now = new Date();
  const timeString = now.toLocaleTimeString();

  priceChartInstance = new Chart(ctx, {
    type: "line",
    data: {
      labels: priceHistory.map((item) =>
        new Date(item.timestamp).toLocaleTimeString()
      ),
      datasets: [
        {
          label: "Gold Price (USD) - Real-time Data",
          data: priceHistory.map((item) => item.price),
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
        subtitle: {
          display: true,
          text: `Last updated: ${timeString} (Updates every minute)`,
          color: "#FFFFFF",
          font: {
            size: 12,
            style: "italic",
          },
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

// Tooltip functionality
document.addEventListener("DOMContentLoaded", function () {
  const tooltips = document.querySelectorAll(".info-tooltip");

  tooltips.forEach((tooltip) => {
    tooltip.addEventListener("click", function (e) {
      e.stopPropagation();

      // Close all other tooltips
      tooltips.forEach((t) => {
        if (t !== tooltip) {
          t.classList.remove("active");
        }
      });

      // Toggle current tooltip
      tooltip.classList.toggle("active");
    });
  });

  // Close tooltip when clicking outside
  document.addEventListener("click", function (e) {
    if (!e.target.closest(".info-tooltip")) {
      tooltips.forEach((tooltip) => {
        tooltip.classList.remove("active");
      });
    }
  });
});
