// Coach Attendance Management JavaScript

document.addEventListener("DOMContentLoaded", () => {
  initializeAttendance()
  setupEventListeners()
  loadAttendanceData()
})

function initializeAttendance() {
  // Initialize attendance tracking
  setupAttendanceButtons()

  // Initialize filters
  setupFilters()

  // Load current session
  loadCurrentSession()
}

function setupEventListeners() {
  // Take attendance button
  window.takeAttendance = () => {
    startAttendanceSession()
  }

  // Export attendance
  window.exportAttendance = () => {
    exportAttendanceData()
  }

  // Save attendance
  window.saveAttendance = () => {
    saveCurrentAttendance()
  }

  // Edit session
  window.editSession = () => {
    showEditSessionModal()
  }

  // View session details
  window.viewSessionDetails = (sessionId) => {
    showSessionDetails(sessionId)
  }

  // Edit session attendance
  window.editSessionAttendance = (sessionId) => {
    showEditAttendanceModal(sessionId)
  }
}

function setupAttendanceButtons() {
  // Mark attendance function
  window.markAttendance = (playerId, status) => {
    const playerRow =
      document.querySelector(`[data-player-id="${playerId}"]`) ||
      document.querySelectorAll(".attendance-player")[playerId - 1]

    if (playerRow) {
      const statusButtons = playerRow.querySelectorAll(".status-btn")

      // Remove active class from all buttons
      statusButtons.forEach((btn) => btn.classList.remove("active"))

      // Add active class to selected button
      const selectedButton = playerRow.querySelector(`.status-btn.${status}`)
      if (selectedButton) {
        selectedButton.classList.add("active")
      }

      // Update player status
      updatePlayerAttendanceStatus(playerId, status)

      // Show feedback
      showNotification(`Player attendance marked as ${status}`, "success")
    }
  }
}

function setupFilters() {
  const periodFilter = document.getElementById("period-filter")
  const playerFilter = document.getElementById("player-filter")

  if (periodFilter) {
    periodFilter.addEventListener("change", function () {
      filterAttendanceHistory(this.value, playerFilter?.value || "")
    })
  }

  if (playerFilter) {
    playerFilter.addEventListener("change", function () {
      filterAttendanceHistory(periodFilter?.value || "week", this.value)
    })
  }
}

function loadAttendanceData() {
  showLoadingState()

  setTimeout(() => {
    updateOverviewStats()
    loadAttendanceHistory()
    hideLoadingState()
  }, 1000)
}

function loadCurrentSession() {
  // Load today's session data
  const sessionData = {
    title: "Morning Training",
    date: "January 28, 2024",
    time: "9:00 AM",
    players: [
      { id: 1, name: "Youssef Bassiony", position: "Forward #11", status: "present" },
      { id: 2, name: "Ahmed Zizo", position: "Midfielder #8", status: "present" },
      { id: 3, name: "Karim Fouad", position: "Defender #4", status: "excused" },
      { id: 4, name: "Hassan Ahmed", position: "Goalkeeper #1", status: "present" },
    ],
  }

  // Update session header
  const sessionInfo = document.querySelector(".session-info")
  if (sessionInfo) {
    sessionInfo.querySelector("h3").textContent = `Today's Training Session`
    sessionInfo.querySelector("p").textContent = `${sessionData.title} - ${sessionData.date} at ${sessionData.time}`
  }

  // Set initial attendance status
  sessionData.players.forEach((player) => {
    window.markAttendance(player.id, player.status)
  })
}

function updateOverviewStats() {
  // Animate overview statistics
  const stats = [
    { selector: ".overview-card:nth-child(1) h3", value: "92%" },
    { selector: ".overview-card:nth-child(2) h3", value: "12" },
    { selector: ".overview-card:nth-child(3) h3", value: "3" },
    { selector: ".overview-card:nth-child(4) h3", value: "8" },
  ]

  stats.forEach((stat, index) => {
    setTimeout(() => {
      const element = document.querySelector(stat.selector)
      if (element) {
        animateValue(element, stat.value)
      }
    }, index * 200)
  })
}

function loadAttendanceHistory() {
  const historyData = [
    {
      id: 1,
      date: "Jan 27, 2024",
      session: "Evening Training",
      present: 23,
      absent: 1,
      excused: 1,
      rate: 92,
    },
    {
      id: 2,
      date: "Jan 26, 2024",
      session: "Morning Training",
      present: 24,
      absent: 0,
      excused: 1,
      rate: 96,
    },
    {
      id: 3,
      date: "Jan 25, 2024",
      session: "Tactical Session",
      present: 22,
      absent: 2,
      excused: 1,
      rate: 88,
    },
  ]

  // This would typically update the history table
  console.log("Attendance history loaded:", historyData)
}

function updatePlayerAttendanceStatus(playerId, status) {
  // Store attendance data (would typically send to server)
  const attendanceData = {
    playerId: playerId,
    status: status,
    timestamp: new Date().toISOString(),
    sessionId: getCurrentSessionId(),
  }

  console.log("Attendance updated:", attendanceData)

  // Update overview stats
  updateAttendanceOverview()
}

function updateAttendanceOverview() {
  // Recalculate attendance statistics
  const attendanceButtons = document.querySelectorAll(".status-btn.active")
  const stats = {
    present: 0,
    absent: 0,
    excused: 0,
  }

  attendanceButtons.forEach((button) => {
    if (button.classList.contains("present")) stats.present++
    else if (button.classList.contains("absent")) stats.absent++
    else if (button.classList.contains("excused")) stats.excused++
  })

  const total = stats.present + stats.absent + stats.excused
  const attendanceRate = total > 0 ? Math.round((stats.present / total) * 100) : 0

  // Update the overview cards
  updateOverviewCard(1, `${attendanceRate}%`)
  updateOverviewCard(2, total.toString())
  updateOverviewCard(3, stats.absent.toString())
}

function updateOverviewCard(cardIndex, value) {
  const card = document.querySelector(`.overview-card:nth-child(${cardIndex}) h3`)
  if (card) {
    card.textContent = value
    card.style.transform = "scale(1.1)"
    setTimeout(() => {
      card.style.transform = "scale(1)"
    }, 200)
  }
}

function startAttendanceSession() {
  showNotification("Starting new attendance session...", "info")

  // Reset all attendance buttons
  const statusButtons = document.querySelectorAll(".status-btn")
  statusButtons.forEach((btn) => btn.classList.remove("active"))

  // Enable attendance taking
  const attendanceGrid = document.querySelector(".attendance-grid")
  if (attendanceGrid) {
    attendanceGrid.style.opacity = "1"
    attendanceGrid.style.pointerEvents = "auto"
  }
}

function saveCurrentAttendance() {
  const attendanceData = []
  const players = document.querySelectorAll(".attendance-player")

  players.forEach((player, index) => {
    const activeButton = player.querySelector(".status-btn.active")
    const playerName = player.querySelector("h4").textContent
    const status = activeButton ? getStatusFromButton(activeButton) : "absent"

    attendanceData.push({
      playerId: index + 1,
      playerName: playerName,
      status: status,
    })
  })

  // Simulate saving to server
  setTimeout(() => {
    showNotification("Attendance saved successfully!", "success")
    updateAttendanceHistory(attendanceData)
  }, 500)
}

function getStatusFromButton(button) {
  if (button.classList.contains("present")) return "present"
  if (button.classList.contains("absent")) return "absent"
  if (button.classList.contains("excused")) return "excused"
  return "absent"
}

function filterAttendanceHistory(period, playerId) {
  // Filter attendance history based on period and player
  showLoadingState()

  setTimeout(() => {
    // This would filter the actual data
    console.log(`Filtering attendance: period=${period}, player=${playerId}`)
    hideLoadingState()
    showNotification("Attendance history filtered", "info")
  }, 500)
}

function exportAttendanceData() {
  // Create CSV data
  const csvData = [
    ["Date", "Session", "Player", "Status"],
    ["Jan 28, 2024", "Morning Training", "Youssef Bassiony", "Present"],
    ["Jan 28, 2024", "Morning Training", "Ahmed Zizo", "Present"],
    ["Jan 28, 2024", "Morning Training", "Karim Fouad", "Excused"],
    ["Jan 28, 2024", "Morning Training", "Hassan Ahmed", "Present"],
  ]

  const csvContent = csvData.map((row) => row.join(",")).join("\n")
  const blob = new Blob([csvContent], { type: "text/csv" })
  const url = window.URL.createObjectURL(blob)

  const a = document.createElement("a")
  a.href = url
  a.download = "attendance-report.csv"
  a.click()

  window.URL.revokeObjectURL(url)
  showNotification("Attendance report exported successfully!", "success")
}

function showEditSessionModal() {
  const modal = createModal(
    "Edit Session",
    `
        <div class="edit-session-form">
            <div class="form-group">
                <label>Session Name</label>
                <input type="text" value="Morning Training" />
            </div>
            <div class="form-group">
                <label>Date</label>
                <input type="date" value="2024-01-28" />
            </div>
            <div class="form-group">
                <label>Time</label>
                <input type="time" value="09:00" />
            </div>
            <div class="form-group">
                <label>Session Type</label>
                <select>
                    <option value="training">Training</option>
                    <option value="match">Match</option>
                    <option value="tactical">Tactical</option>
                    <option value="physical">Physical</option>
                </select>
            </div>
            <div class="form-actions">
                <button class="btn-outline" onclick="closeModal()">Cancel</button>
                <button class="btn-primary" onclick="saveSessionChanges()">Save Changes</button>
            </div>
        </div>
    `,
  )
}

function showSessionDetails(sessionId) {
  const sessionData = {
    1: { name: "Evening Training", date: "Jan 27, 2024", present: 23, absent: 1, excused: 1 },
    2: { name: "Morning Training", date: "Jan 26, 2024", present: 24, absent: 0, excused: 1 },
    3: { name: "Tactical Session", date: "Jan 25, 2024", present: 22, absent: 2, excused: 1 },
  }

  const session = sessionData[sessionId]
  if (session) {
    const modal = createModal(
      "Session Details",
      `
            <div class="session-details">
                <h4>${session.name}</h4>
                <p><strong>Date:</strong> ${session.date}</p>
                <div class="attendance-summary">
                    <div class="summary-item">
                        <span class="label">Present:</span>
                        <span class="value present">${session.present}</span>
                    </div>
                    <div class="summary-item">
                        <span class="label">Absent:</span>
                        <span class="value absent">${session.absent}</span>
                    </div>
                    <div class="summary-item">
                        <span class="label">Excused:</span>
                        <span class="value excused">${session.excused}</span>
                    </div>
                </div>
                <div class="session-actions">
                    <button class="btn-outline" onclick="closeModal()">Close</button>
                    <button class="btn-primary" onclick="window.editSessionAttendance(${sessionId})">Edit Attendance</button>
                </div>
            </div>
        `,
    )
  }
}

function getCurrentSessionId() {
  return Date.now() // Simple session ID generation
}

function animateValue(element, targetValue) {
  element.style.transform = "scale(1.1)"
  element.textContent = targetValue

  setTimeout(() => {
    element.style.transform = "scale(1)"
  }, 200)
}

function showLoadingState() {
  const cards = document.querySelectorAll(".overview-card, .current-session, .attendance-history")
  cards.forEach((card) => {
    card.style.opacity = "0.6"
    card.style.pointerEvents = "none"
  })
}

function hideLoadingState() {
  const cards = document.querySelectorAll(".overview-card, .current-session, .attendance-history")
  cards.forEach((card) => {
    card.style.opacity = "1"
    card.style.pointerEvents = "auto"
  })
}

function createModal(title, content) {
  const modal = document.createElement("div")
  modal.className = "modal"
  modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>${title}</h3>
                <span class="close" onclick="closeModal()">&times;</span>
            </div>
            <div class="modal-body">
                ${content}
            </div>
        </div>
    `

  document.body.appendChild(modal)
  modal.style.display = "block"

  return modal
}

function closeModal() {
  const modal = document.querySelector(".modal")
  if (modal) {
    document.body.removeChild(modal)
  }
}

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

function updateAttendanceHistory(attendanceData) {
  // Update attendance history table
  console.log("Updating attendance history:", attendanceData)
}

function showEditAttendanceModal(sessionId) {
  // Placeholder for showEditAttendanceModal function
  console.log(`Editing attendance for session ID: ${sessionId}`)
}
