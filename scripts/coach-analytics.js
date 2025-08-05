// Coach Analytics JavaScript

document.addEventListener("DOMContentLoaded", () => {
  initializeAnalytics()
  setupEventListeners()
  loadAnalyticsData()
})

function initializeAnalytics() {
  // Initialize chart controls
  const chartBtns = document.querySelectorAll(".chart-btn")
  chartBtns.forEach((btn) => {
    btn.addEventListener("click", function () {
      // Remove active class from all buttons
      chartBtns.forEach((b) => b.classList.remove("active"))
      // Add active class to clicked button
      this.classList.add("active")

      // Update chart based on selected metric
      const metric = this.dataset.metric
      updatePerformanceChart(metric)
    })
  })
}

function setupEventListeners() {
  // Period filter change
  const periodFilter = document.getElementById("analytics-period")
  if (periodFilter) {
    periodFilter.addEventListener("change", function () {
      loadAnalyticsData(this.value)
    })
  }

  // Export analytics
  window.exportAnalytics = () => {
    // Simulate export functionality
    showNotification("Analytics report exported successfully!", "success")
  }
}

function loadAnalyticsData(period = "month") {
  // Simulate loading analytics data
  showLoadingState()

  setTimeout(() => {
    updateOverviewCards(period)
    updateCharts(period)
    updatePlayerDevelopment(period)
    hideLoadingState()
  }, 1000)
}

function updateOverviewCards(period) {
  // Update coaching score
  const coachingScore = document.querySelector(".overview-card.coaching .score")
  if (coachingScore) {
    animateNumber(coachingScore, 8.7)
  }

  // Update sessions count
  const sessionsCount = document.querySelector(".overview-card.sessions .score")
  if (sessionsCount) {
    animateNumber(sessionsCount, 48)
  }

  // Update improvement percentage
  const improvementScore = document.querySelector(".overview-card.improvement .score")
  if (improvementScore) {
    improvementScore.textContent = "+15%"
  }

  // Update satisfaction percentage
  const satisfactionScore = document.querySelector(".overview-card.satisfaction .score")
  if (satisfactionScore) {
    animateNumber(satisfactionScore, 94)
  }
}

function updatePerformanceChart(metric = "overall") {
  const chartPoints = document.querySelectorAll(".chart-point")
  const data = getChartData(metric)

  chartPoints.forEach((point, index) => {
    if (data[index]) {
      point.style.bottom = data[index].position
      point.setAttribute("data-value", data[index].value)
    }
  })
}

function getChartData(metric) {
  const data = {
    overall: [
      { position: "45%", value: "7.2" },
      { position: "55%", value: "7.8" },
      { position: "65%", value: "8.3" },
      { position: "70%", value: "8.5" },
      { position: "75%", value: "8.7" },
      { position: "80%", value: "9.0" },
    ],
    physical: [
      { position: "40%", value: "6.8" },
      { position: "50%", value: "7.2" },
      { position: "60%", value: "7.8" },
      { position: "65%", value: "8.0" },
      { position: "70%", value: "8.3" },
      { position: "75%", value: "8.5" },
    ],
    tactical: [
      { position: "50%", value: "7.5" },
      { position: "60%", value: "8.0" },
      { position: "70%", value: "8.5" },
      { position: "75%", value: "8.8" },
      { position: "80%", value: "9.0" },
      { position: "85%", value: "9.2" },
    ],
    technical: [
      { position: "45%", value: "7.0" },
      { position: "55%", value: "7.5" },
      { position: "65%", value: "8.0" },
      { position: "70%", value: "8.2" },
      { position: "75%", value: "8.5" },
      { position: "80%", value: "8.8" },
    ],
  }

  return data[metric] || data.overall
}

function updateCharts(period) {
  // Update performance chart
  updatePerformanceChart("overall")

  // Update donut chart segments
  updateDonutChart()
}

function updateDonutChart() {
  const segments = document.querySelectorAll(".donut-segment")
  const data = [
    { label: "Technical", value: "40%", color: "#dc2626" },
    { label: "Tactical", value: "30%", color: "#059669" },
    { label: "Physical", value: "20%", color: "#d97706" },
    { label: "Recovery", value: "10%", color: "#7c3aed" },
  ]

  segments.forEach((segment, index) => {
    if (data[index]) {
      segment.style.setProperty("--color", data[index].color)
      const label = segment.querySelector(".segment-label")
      const value = segment.querySelector(".segment-value")
      if (label) label.textContent = data[index].label
      if (value) value.textContent = data[index].value
    }
  })
}

function updatePlayerDevelopment(period) {
  const developmentItems = document.querySelectorAll(".development-item")
  const progressBars = document.querySelectorAll(".development-progress .progress-fill")

  // Animate progress bars
  progressBars.forEach((bar, index) => {
    const widths = ["85%", "78%", "72%"]
    if (widths[index]) {
      setTimeout(() => {
        bar.style.width = widths[index]
      }, index * 200)
    }
  })
}

function animateNumber(element, targetNumber) {
  const startNumber = 0
  const duration = 1000
  const startTime = performance.now()

  function updateNumber(currentTime) {
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / duration, 1)

    const currentNumber = startNumber + (targetNumber - startNumber) * progress
    element.textContent = Math.round(currentNumber * 10) / 10

    if (progress < 1) {
      requestAnimationFrame(updateNumber)
    }
  }

  requestAnimationFrame(updateNumber)
}

function showLoadingState() {
  const cards = document.querySelectorAll(".overview-card, .chart-card, .detail-card")
  cards.forEach((card) => {
    card.style.opacity = "0.6"
    card.style.pointerEvents = "none"
  })
}

function hideLoadingState() {
  const cards = document.querySelectorAll(".overview-card, .chart-card, .detail-card")
  cards.forEach((card) => {
    card.style.opacity = "1"
    card.style.pointerEvents = "auto"
  })
}

function showNotification(message, type = "info") {
  // Create notification element
  const notification = document.createElement("div")
  notification.className = `notification notification-${type}`
  notification.textContent = message

  // Style the notification
  notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === "success" ? "#10b981" : "#3b82f6"};
        color: white;
        padding: 12px 24px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 1000;
        font-size: 14px;
        font-weight: 500;
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `

  document.body.appendChild(notification)

  // Animate in
  setTimeout(() => {
    notification.style.transform = "translateX(0)"
  }, 100)

  // Remove after 3 seconds
  setTimeout(() => {
    notification.style.transform = "translateX(100%)"
    setTimeout(() => {
      document.body.removeChild(notification)
    }, 300)
  }, 3000)
}

// Chart interaction handlers
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("chart-point")) {
    // Remove active class from all points
    document.querySelectorAll(".chart-point").forEach((point) => {
      point.classList.remove("active")
    })

    // Add active class to clicked point
    e.target.classList.add("active")

    // Show point details (could expand this functionality)
    const value = e.target.getAttribute("data-value")
    console.log("Chart point value:", value)
  }
})
