// Player Dashboard JavaScript

document.addEventListener("DOMContentLoaded", () => {
  initializePlayerDashboard()
  setupEventListeners()
  loadPlayerData()
})

function initializePlayerDashboard() {
  // Initialize dashboard components
  setupProgressRings()
  setupChartInteractions()
  loadScheduleData()
  loadPerformanceData()
}

function setupEventListeners() {
  // Theme toggle
  const themeToggle = document.querySelector(".theme-toggle")
  if (themeToggle) {
    themeToggle.addEventListener("click", toggleTheme)
  }

  // Sidebar toggle
  const sidebarToggle = document.querySelector(".sidebar-toggle")
  if (sidebarToggle) {
    sidebarToggle.addEventListener("click", toggleSidebar)
  }

  // User menu dropdown
  const userMenu = document.querySelector(".user-menu")
  if (userMenu) {
    userMenu.addEventListener("click", toggleUserMenu)
  }
}

function setupProgressRings() {
  const progressRings = document.querySelectorAll(".progress-ring-circle.progress")

  progressRings.forEach((ring) => {
    const percentage = 95 // This would come from data
    const circumference = 2 * Math.PI * 34 // radius = 34
    const offset = circumference - (percentage / 100) * circumference

    ring.style.strokeDasharray = circumference
    ring.style.strokeDashoffset = offset
  })
}

function setupChartInteractions() {
  const chartPoints = document.querySelectorAll(".chart-point")

  chartPoints.forEach((point) => {
    point.addEventListener("mouseenter", function () {
      this.classList.add("active")
    })

    point.addEventListener("mouseleave", function () {
      this.classList.remove("active")
    })
  })
}

function loadPlayerData() {
  showLoadingState()

  setTimeout(() => {
    updatePlayerStats()
    loadRecentActivity()
    updateMetrics()
    hideLoadingState()
  }, 1000)
}

function updatePlayerStats() {
  // Animate stat values
  const stats = [
    { selector: ".quick-stats .stat-item:nth-child(1) .stat-value", value: "95%" },
    { selector: ".quick-stats .stat-item:nth-child(2) .stat-value", value: "23" },
    { selector: ".quick-stats .stat-item:nth-child(3) .stat-value", value: "12" },
    { selector: ".quick-stats .stat-item:nth-child(4) .stat-value", value: "1,890" },
  ]

  stats.forEach((stat, index) => {
    setTimeout(() => {
      const element = document.querySelector(stat.selector)
      if (element) {
        animateStatValue(element, stat.value)
      }
    }, index * 200)
  })
}

function loadScheduleData() {
  // Load today's schedule
  const scheduleItems = document.querySelectorAll(".schedule-item")

  scheduleItems.forEach((item, index) => {
    setTimeout(() => {
      item.style.opacity = "1"
      item.style.transform = "translateY(0)"
    }, index * 100)
  })
}

function loadPerformanceData() {
  // Load performance metrics
  const metricBars = document.querySelectorAll(".metric-fill")
  const metricValues = ["95%", "90%", "87%", "88%"]

  metricBars.forEach((bar, index) => {
    setTimeout(() => {
      bar.style.width = metricValues[index]
    }, index * 200)
  })
}

function loadRecentActivity() {
  // Load announcements and recent activity
  const announcements = document.querySelectorAll(".announcement-item")

  announcements.forEach((announcement, index) => {
    setTimeout(() => {
      announcement.style.opacity = "1"
      announcement.style.transform = "translateX(0)"
    }, index * 150)
  })
}

function updateMetrics() {
  // Update performance metrics with animation
  const metrics = document.querySelectorAll(".metric-item")

  metrics.forEach((metric, index) => {
    setTimeout(() => {
      const fill = metric.querySelector(".metric-fill")
      const value = metric.querySelector(".metric-value")

      if (fill && value) {
        const targetWidth = fill.style.width || "0%"
        fill.style.width = targetWidth

        // Animate the value
        const targetValue = Number.parseFloat(value.textContent)
        animateNumber(value, targetValue)
      }
    }, index * 100)
  })
}

function animateStatValue(element, targetValue) {
  element.style.transform = "scale(1.1)"
  element.textContent = targetValue

  setTimeout(() => {
    element.style.transform = "scale(1)"
  }, 200)
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

function toggleTheme() {
  document.body.classList.toggle("dark-theme")
  const isDark = document.body.classList.contains("dark-theme")

  // Store theme preference
  localStorage.setItem("theme", isDark ? "dark" : "light")

  // Update theme icon
  const themeIcon = document.querySelector(".theme-toggle i")
  if (themeIcon) {
    themeIcon.className = isDark ? "fas fa-sun" : "fas fa-moon"
  }
}

function toggleSidebar() {
  const sidebar = document.querySelector(".sidebar")
  const mainContent = document.querySelector(".main-content")

  if (sidebar && mainContent) {
    sidebar.classList.toggle("collapsed")
    mainContent.classList.toggle("expanded")
  }
}

function toggleUserMenu() {
  const dropdown = document.querySelector(".dropdown-menu")
  if (dropdown) {
    dropdown.classList.toggle("show")
  }
}

function showLoadingState() {
  const cards = document.querySelectorAll(".dashboard-card")
  cards.forEach((card) => {
    card.style.opacity = "0.6"
    card.style.pointerEvents = "none"
  })
}

function hideLoadingState() {
  const cards = document.querySelectorAll(".dashboard-card")
  cards.forEach((card) => {
    card.style.opacity = "1"
    card.style.pointerEvents = "auto"
  })
}

// Initialize theme on page load
function initializeTheme() {
  const savedTheme = localStorage.getItem("theme")
  if (savedTheme === "dark") {
    document.body.classList.add("dark-theme")
    const themeIcon = document.querySelector(".theme-toggle i")
    if (themeIcon) {
      themeIcon.className = "fas fa-sun"
    }
  }
}

// Call theme initialization
initializeTheme()

// Notification system
function showNotification(message, type = "info") {
  const notification = document.createElement("div")
  notification.className = `notification notification-${type}`
  notification.textContent = message

  notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === "success" ? "#10b981" : type === "error" ? "#ef4444" : "#3b82f6"};
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

  setTimeout(() => {
    notification.style.transform = "translateX(0)"
  }, 100)

  setTimeout(() => {
    notification.style.transform = "translateX(100%)"
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification)
      }
    }, 300)
  }, 3000)
}

// Auto-refresh data every 5 minutes
setInterval(
  () => {
    loadPlayerData()
  },
  5 * 60 * 1000,
)
