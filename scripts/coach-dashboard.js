// Coach Dashboard functionality
document.addEventListener("DOMContentLoaded", () => {
  initializeDashboard()
  loadDashboardData()
  setupEventListeners()

  // New session modal
  let newSessionModalOpen = false
  window.openNewSessionModal = () => {
    newSessionModalOpen = true
    const modal = document.getElementById("new-session-modal")
    if (modal) {
      modal.style.display = "block"
    }
  }

  window.closeNewSessionModal = () => {
    newSessionModalOpen = false
    const modal = document.getElementById("new-session-modal")
    if (modal) {
      modal.style.display = "none"
    }
  }

  // Quick stats update
  function updateDashboardStats() {
    // This would typically fetch real data from an API
    const stats = {
      players: 25,
      sessions: 12,
      attendance: 92,
      rating: 8.4,
    }

    // Update stat cards with animation
    animateCounter(".stat-card:nth-child(1) h3", stats.players)
    animateCounter(".stat-card:nth-child(2) h3", stats.sessions)
    animateCounter(".stat-card:nth-child(3) h3", stats.attendance, "%")
    animateCounter(".stat-card:nth-child(4) h3", stats.rating)
  }

  function animateCounter(selector, target, suffix = "") {
    const element = document.querySelector(selector)
    if (!element) return

    const start = 0
    const duration = 1000
    const startTime = performance.now()

    function update(currentTime) {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      const current = start + (target - start) * progress

      if (suffix === "%") {
        element.textContent = Math.round(current) + suffix
      } else {
        element.textContent = current.toFixed(1)
      }

      if (progress < 1) {
        requestAnimationFrame(update)
      }
    }

    requestAnimationFrame(update)
  }

  // Initialize dashboard
  function initializeDashboard() {
    // Initialize dashboard components
    updateDateTime()
    loadRecentActivity()
    loadTopPerformers()
    loadTodaySessions()

    // Update time every minute
    setInterval(updateDateTime, 60000)
  }

  function updateDateTime() {
    const now = new Date()
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }

    // Update any datetime displays
    const dateElements = document.querySelectorAll(".current-date")
    dateElements.forEach((element) => {
      element.textContent = now.toLocaleDateString("en-US", options)
    })
  }

  function loadDashboardData() {
    // Simulate loading dashboard data
    const stats = {
      totalPlayers: 25,
      sessionsThisWeek: 12,
      attendanceRate: 92,
      teamRating: 8.4,
    }

    updateStatsCards(stats)
  }

  function updateStatsCards(stats) {
    // Update stat cards with real data
    const statCards = document.querySelectorAll(".stat-card")

    statCards.forEach((card, index) => {
      const valueElement = card.querySelector("h3")
      const changeElement = card.querySelector(".stat-change")

      switch (index) {
        case 0: // Players
          valueElement.textContent = stats.totalPlayers
          break
        case 1: // Sessions
          valueElement.textContent = stats.sessionsThisWeek
          break
        case 2: // Attendance
          valueElement.textContent = stats.attendanceRate + "%"
          break
        case 3: // Rating
          valueElement.textContent = stats.teamRating
          break
      }
    })
  }

  function loadTodaySessions() {
    // Load today's training sessions
    const sessions = [
      {
        id: 1,
        title: "Morning Training Session",
        time: "9:00 AM",
        location: "Main Training Ground",
        players: 25,
        type: "football",
      },
      {
        id: 2,
        title: "Tactical Training",
        time: "4:00 PM",
        location: "Tactical Room",
        players: 25,
        type: "football",
      },
      {
        id: 3,
        title: "Recovery Session",
        time: "10:00 AM (Tomorrow)",
        location: "Recovery Center",
        players: 15,
        type: "football",
      },
    ]

    // Update sessions list in UI
    updateSessionsList(sessions)
  }

  function updateSessionsList(sessions) {
    const sessionsList = document.querySelector(".sessions-list")
    if (!sessionsList) return

    sessionsList.innerHTML = sessions
      .map(
        (session) => `
        <div class="session-item" data-session-id="${session.id}">
            <div class="session-icon ${session.type}">
                <i class="fas fa-futbol"></i>
            </div>
            <div class="session-info">
                <h4>${session.title}</h4>
                <div class="session-meta">
                    <span class="sport">Football</span>
                    <span class="team">First Team</span>
                    <span class="coach">${session.location}</span>
                </div>
            </div>
            <div class="session-details">
                <div class="session-time">
                    <i class="fas fa-clock"></i>
                    ${session.time}
                </div>
                <div class="session-status scheduled">
                    <i class="fas fa-users"></i>
                    ${session.players} Players
                </div>
            </div>
        </div>
    `,
      )
      .join("")
  }

  function loadTopPerformers() {
    const performers = [
      {
        id: 1,
        name: "Youssef Bassiony",
        position: "Forward",
        attendance: "98%",
        rating: 9.2,
        avatar: "https://images.unsplash.com/photo-1566753323558-f4e0952af115?w=40&h=40&fit=crop&crop=face",
      },
      {
        id: 2,
        name: "Ahmed Zizo",
        position: "Midfielder",
        attendance: "95%",
        rating: 8.8,
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
      },
      {
        id: 3,
        name: "Karim Fouad",
        position: "Defender",
        attendance: "92%",
        rating: 8.6,
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
      },
      {
        id: 4,
        name: "Hassan Ahmed",
        position: "Goalkeeper",
        attendance: "100%",
        rating: 8.4,
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop&crop=face",
      },
    ]

    updatePerformersList(performers)
  }

  function updatePerformersList(performers) {
    const performersList = document.querySelector(".performers-list")
    if (!performersList) return

    performersList.innerHTML = performers
      .map(
        (performer, index) => `
        <div class="performer-item">
            <div class="performer-rank">#${index + 1}</div>
            <img src="${performer.avatar}" alt="${performer.name}" class="performer-avatar">
            <div class="performer-info">
                <h4>${performer.name}</h4>
                <div class="performer-meta">
                    <span class="sport">${performer.position}</span>
                    <span class="position">${performer.attendance} Attendance</span>
                </div>
            </div>
            <div class="performer-rating">
                <span class="rating">${performer.rating}</span>
                <span class="rating-label">Rating</span>
            </div>
        </div>
    `,
      )
      .join("")
  }

  function loadRecentActivity() {
    const activities = [
      {
        type: "new",
        icon: "fas fa-user-plus",
        message: "<strong>New player</strong> Mohamed Tarek joined your team",
        time: "2 hours ago",
      },
      {
        type: "update",
        icon: "fas fa-clipboard-check",
        message: "<strong>Attendance</strong> recorded for morning training session",
        time: "4 hours ago",
      },
      {
        type: "announcement",
        icon: "fas fa-star",
        message: "<strong>Performance review</strong> completed for 5 players",
        time: "1 day ago",
      },
    ]

    updateActivityList(activities)
  }

  function updateActivityList(activities) {
    const activityList = document.querySelector(".activity-list")
    if (!activityList) return

    activityList.innerHTML = activities
      .map(
        (activity) => `
        <div class="activity-item">
            <div class="activity-icon ${activity.type}">
                <i class="${activity.icon}"></i>
            </div>
            <div class="activity-content">
                <p>${activity.message}</p>
                <span class="activity-time">${activity.time}</span>
            </div>
        </div>
    `,
      )
      .join("")
  }

  function setupEventListeners() {
    // New session modal
    const newSessionBtn = document.querySelector(".new-session-btn")
    if (newSessionBtn) {
      newSessionBtn.addEventListener("click", window.openNewSessionModal)
    }

    // Quick actions
    const quickActions = document.querySelectorAll(".quick-action")
    quickActions.forEach((action) => {
      action.addEventListener("click", handleQuickAction)
    })

    // Session items
    const sessionItems = document.querySelectorAll(".session-item")
    sessionItems.forEach((item) => {
      item.addEventListener("click", handleSessionClick)
    })
  }

  function handleQuickAction(event) {
    event.preventDefault()
    const action = event.currentTarget
    const href = action.getAttribute("href")

    if (href) {
      window.location.href = href
    }
  }

  function handleSessionClick(event) {
    const sessionItem = event.currentTarget
    const sessionId = sessionItem.dataset.sessionId

    // Navigate to session details or show modal
    console.log("Session clicked:", sessionId)
  }

  // Form submission
  document.addEventListener("submit", (event) => {
    if (event.target.id === "new-session-form") {
      event.preventDefault()
      handleNewSessionSubmit(event.target)
    }
  })

  function handleNewSessionSubmit(form) {
    const formData = new FormData(form)
    const sessionData = {
      title: formData.get("title"),
      type: formData.get("type"),
      location: formData.get("location"),
      date: formData.get("date"),
      startTime: formData.get("start-time"),
      endTime: formData.get("end-time"),
      description: formData.get("description"),
    }

    // Simulate API call
    console.log("Creating new session:", sessionData)

    // Show success message
    showNotification("Training session created successfully!", "success")

    // Close modal
    window.closeNewSessionModal()

    // Refresh sessions list
    loadTodaySessions()
  }

  function showNotification(message, type = "info") {
    // Create notification element
    const notification = document.createElement("div")
    notification.className = `notification ${type}`
    notification.innerHTML = message

    // Add to page
    document.body.appendChild(notification)

    // Remove after 3 seconds
    setTimeout(() => {
      notification.remove()
    }, 3000)
  }

  // Close modal when clicking outside
  window.addEventListener("click", (event) => {
    const modal = document.getElementById("new-session-modal")
    if (modal && event.target === modal && newSessionModalOpen) {
      window.closeNewSessionModal()
    }
  })
})
