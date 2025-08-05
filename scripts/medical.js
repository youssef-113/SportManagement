// Medical Dashboard JavaScript functionality
document.addEventListener("DOMContentLoaded", () => {
  // New Checkup Modal
  window.openNewCheckupModal = () => {
    openModal("new-checkup-modal")
  }

  window.closeNewCheckupModal = () => {
    closeModal("new-checkup-modal")
  }

  // Emergency Modal
  window.openEmergencyModal = () => {
    openModal("emergency-modal")
  }

  window.closeEmergencyModal = () => {
    closeModal("emergency-modal")
  }

  // Emergency Actions
  window.callAmbulance = () => {
    showNotification("Emergency services have been contacted!", "success")
    closeModal("emergency-modal")
  }

  window.firstAidProtocol = () => {
    showNotification("First aid protocol initiated", "info")
  }

  window.notifyStaff = () => {
    showNotification("Medical staff have been notified", "success")
  }

  window.reportIncident = () => {
    showNotification("Incident report created", "info")
  }

  // Medical Players Page Functions
  window.clearMedicalFilters = () => {
    const filters = document.querySelectorAll(".medical-search-filters select")
    filters.forEach((filter) => {
      filter.value = ""
    })
    applyMedicalFilters()
  }

  function applyMedicalFilters() {
    const teamFilter = document.getElementById("team-filter")?.value
    const statusFilter = document.getElementById("status-filter")?.value
    const positionFilter = document.getElementById("position-filter")?.value

    const playerCards = document.querySelectorAll(".medical-player-card")

    playerCards.forEach((card) => {
      let show = true

      // Apply filters logic here
      if (statusFilter) {
        const status = card.querySelector(".medical-status")
        if (!status?.classList.contains(statusFilter)) {
          show = false
        }
      }

      card.style.display = show ? "block" : "none"
    })
  }

  // Player Actions
  window.viewMedicalHistory = (playerId) => {
    // Populate modal with player data
    document.getElementById("history-player-name").textContent = `Player ${playerId}`
    openModal("medical-history-modal")
  }

  window.updatePlayerStatus = (playerId) => {
    // Populate modal with player data
    document.getElementById("status-player-name").value = `Player ${playerId}`
    openModal("update-status-modal")
  }

  window.scheduleCheckup = (playerId) => {
    showNotification(`Checkup scheduled for Player ${playerId}`, "success")
  }

  window.chatWithPlayer = (playerId) => {
    window.location.href = "medical-chat.html"
  }

  // Update Status Modal
  window.closeUpdateStatusModal = () => {
    closeModal("update-status-modal")
  }

  window.closeMedicalHistoryModal = () => {
    closeModal("medical-history-modal")
  }

  // Status change handler
  const statusSelect = document.getElementById("player-status")
  if (statusSelect) {
    statusSelect.addEventListener("change", function () {
      const injuryDetails = document.getElementById("injury-details")
      const recoveryTime = document.getElementById("recovery-time")

      if (this.value === "injured") {
        injuryDetails.style.display = "block"
        recoveryTime.style.display = "block"
      } else if (this.value === "recovering") {
        injuryDetails.style.display = "none"
        recoveryTime.style.display = "block"
      } else {
        injuryDetails.style.display = "none"
        recoveryTime.style.display = "none"
      }
    })
  }

  // Chat Functionality
  const chatItems = document.querySelectorAll(".chat-item")
  chatItems.forEach((item) => {
    item.addEventListener("click", function () {
      // Remove active class from all items
      chatItems.forEach((chatItem) => chatItem.classList.remove("active"))

      // Add active class to clicked item
      this.classList.add("active")

      // Update chat main content
      const playerName = this.querySelector("h4").textContent
      document.querySelector(".chat-player-details h3").textContent = playerName

      // Clear unread badge
      const unreadBadge = this.querySelector(".unread-badge")
      if (unreadBadge) {
        unreadBadge.remove()
      }
    })
  })

  // Chat Input
  const messageInput = document.getElementById("message-input")
  if (messageInput) {
    messageInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        window.sendMessage()
      }
    })
  }

  window.sendMessage = () => {
    const messageInput = document.getElementById("message-input")
    const messageText = messageInput.value.trim()

    if (messageText) {
      // Add message to chat
      addMessageToChat(messageText, "sent")
      messageInput.value = ""

      // Simulate response after delay
      setTimeout(() => {
        addMessageToChat("Thank you for the update, Doctor!", "received")
      }, 1000)
    }
  }

  function addMessageToChat(text, type) {
    const chatMessages = document.getElementById("chat-messages")
    const messageDiv = document.createElement("div")
    messageDiv.className = `message ${type}`

    const now = new Date()
    const timeString = now.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })

    messageDiv.innerHTML = `
            <div class="message-content">
                <p>${text}</p>
                <span class="message-time">${timeString}</span>
            </div>
        `

    chatMessages.appendChild(messageDiv)
    chatMessages.scrollTop = chatMessages.scrollHeight
  }

  // Quick Responses
  window.sendQuickResponse = () => {
    openModal("quick-responses-modal")
  }

  window.closeQuickResponsesModal = () => {
    closeModal("quick-responses-modal")
  }

  window.insertQuickResponse = (text) => {
    document.getElementById("message-input").value = text
    closeModal("quick-responses-modal")
  }

  // Medical Templates
  window.sendMedicalTemplate = () => {
    openModal("medical-templates-modal")
  }

  window.closeMedicalTemplatesModal = () => {
    closeModal("medical-templates-modal")
  }

  window.sendTemplate = (templateType) => {
    let templateText = ""
    switch (templateType) {
      case "injury-care":
        templateText = "I'm sending you injury care instructions. Please follow them carefully."
        break
      case "exercise-plan":
        templateText = "Here's your personalized exercise plan for recovery."
        break
      case "nutrition-guide":
        templateText = "I've prepared nutrition guidelines to support your recovery."
        break
      case "rest-schedule":
        templateText = "Please follow this rest schedule for optimal recovery."
        break
    }

    addMessageToChat(templateText, "sent")
    closeModal("medical-templates-modal")
  }

  // File attachment
  window.attachFile = () => {
    showNotification("File attachment feature coming soon", "info")
  }

  // Chat actions
  window.viewPlayerMedicalInfo = () => {
    showNotification("Opening medical information", "info")
  }

  window.scheduleAppointment = () => {
    showNotification("Appointment scheduling opened", "info")
  }

  window.sendMedicalForm = () => {
    showNotification("Medical form sent to player", "success")
  }

  // Checkup Logs Functions
  window.clearCheckupFilters = () => {
    const filters = document.querySelectorAll(".checkup-filters select")
    filters.forEach((filter) => {
      filter.value = ""
    })
    applyCheckupFilters()
  }

  function applyCheckupFilters() {
    const typeFilter = document.getElementById("checkup-type-filter")?.value
    const teamFilter = document.getElementById("team-filter")?.value
    const statusFilter = document.getElementById("status-filter")?.value

    // Apply filters to table rows
    const tableRows = document.querySelectorAll(".checkup-logs-table tbody tr")
    tableRows.forEach((row) => {
      let show = true

      if (typeFilter) {
        const typeCell = row.querySelector(".checkup-type")
        if (!typeCell?.classList.contains(typeFilter)) {
          show = false
        }
      }

      if (statusFilter) {
        const statusCell = row.querySelector(".status")
        if (!statusCell?.classList.contains(statusFilter)) {
          show = false
        }
      }

      row.style.display = show ? "" : "none"
    })
  }

  // Checkup Actions
  window.viewCheckupDetails = (checkupId) => {
    // Populate modal with checkup data
    document.getElementById("details-player-name").textContent = `Checkup ${checkupId} Details`
    openModal("checkup-details-modal")
  }

  window.editCheckup = (checkupId) => {
    showNotification(`Editing checkup ${checkupId}`, "info")
  }

  window.printCheckup = (checkupId) => {
    showNotification(`Printing checkup ${checkupId}`, "info")
    // Here you would typically open a print dialog
  }

  window.cancelCheckup = (checkupId) => {
    if (confirm("Are you sure you want to cancel this checkup?")) {
      showNotification(`Checkup ${checkupId} cancelled`, "success")
    }
  }

  window.closeCheckupDetailsModal = () => {
    closeModal("checkup-details-modal")
  }

  // Export Functions
  window.exportCheckupLogs = () => {
    showNotification("Checkup logs exported successfully", "success")
  }

  window.openBulkUpdateModal = () => {
    showNotification("Bulk update feature coming soon", "info")
  }

  // Search functionality for players
  const playerSearchInput = document.getElementById("player-search")
  if (playerSearchInput) {
    playerSearchInput.addEventListener("input", function () {
      const searchTerm = this.value.toLowerCase()
      const playerCards = document.querySelectorAll(".medical-player-card")

      playerCards.forEach((card) => {
        const playerName = card.querySelector("h3").textContent.toLowerCase()
        const team = card.querySelector(".team")?.textContent.toLowerCase() || ""

        if (playerName.includes(searchTerm) || team.includes(searchTerm)) {
          card.style.display = "block"
          card.classList.add("highlighted")
        } else {
          card.style.display = "none"
          card.classList.remove("highlighted")
        }
      })
    })
  }

  // Chat search functionality
  const chatSearchInput = document.getElementById("chat-search")
  if (chatSearchInput) {
    chatSearchInput.addEventListener("input", function () {
      const searchTerm = this.value.toLowerCase()
      const chatItems = document.querySelectorAll(".chat-item")

      chatItems.forEach((item) => {
        const playerName = item.querySelector("h4").textContent.toLowerCase()
        const lastMessage = item.querySelector(".last-message").textContent.toLowerCase()

        if (playerName.includes(searchTerm) || lastMessage.includes(searchTerm)) {
          item.style.display = "flex"
        } else {
          item.style.display = "none"
        }
      })
    })
  }

  // Form submissions
  const newCheckupForm = document.getElementById("new-checkup-form")
  if (newCheckupForm) {
    newCheckupForm.addEventListener("submit", (e) => {
      e.preventDefault()
      showNotification("Checkup scheduled successfully!", "success")
      closeModal("new-checkup-modal")
    })
  }

  const updateStatusForm = document.getElementById("update-status-form")
  if (updateStatusForm) {
    updateStatusForm.addEventListener("submit", (e) => {
      e.preventDefault()
      showNotification("Player status updated successfully!", "success")
      closeModal("update-status-modal")
    })
  }

  // Helper functions
  function openModal(modalId) {
    const modal = document.getElementById(modalId)
    if (modal) {
      modal.classList.add("active")
      modal.style.display = "flex"
    }
  }

  function closeModal(modalId) {
    const modal = document.getElementById(modalId)
    if (modal) {
      modal.classList.remove("active")
      setTimeout(() => {
        modal.style.display = "none"
      }, 200)
    }
  }

  function showNotification(message, type) {
    // Create notification element
    const notification = document.createElement("div")
    notification.className = `notification ${type}`
    notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === "success" ? "check-circle" : type === "error" ? "exclamation-circle" : "info-circle"}"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `

    document.body.appendChild(notification)

    // Auto remove after 5 seconds
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove()
      }
    }, 5000)
  }

  // Initialize filters
  const medicalFilters = document.querySelectorAll(".medical-search-filters select")
  medicalFilters.forEach((filter) => {
    filter.addEventListener("change", applyMedicalFilters)
  })

  const checkupFilters = document.querySelectorAll(".checkup-filters select")
  checkupFilters.forEach((filter) => {
    filter.addEventListener("change", applyCheckupFilters)
  })

  // New Checkup Log Modal
  window.openNewCheckupLogModal = () => {
    // Set current date and time as defaults
    const now = new Date()
    const today = now.toISOString().split("T")[0]
    const currentTime = now.toTimeString().slice(0, 5)

    document.getElementById("log-date").value = today
    document.getElementById("log-time").value = currentTime

    openModal("new-checkup-log-modal")
  }

  window.closeNewCheckupLogModal = () => {
    closeModal("new-checkup-log-modal")
    // Reset form
    document.getElementById("new-checkup-log-form").reset()
  }

  // Handle new checkup log form submission
  const newCheckupLogForm = document.getElementById("new-checkup-log-form")
  if (newCheckupLogForm) {
    newCheckupLogForm.addEventListener("submit", (e) => {
      e.preventDefault()

      const formData = new FormData(e.target)
      const logData = {
        player: formData.get("player"),
        type: formData.get("type"),
        date: formData.get("date"),
        time: formData.get("time"),
        duration: formData.get("duration"),
        location: formData.get("location"),
        findings: formData.get("findings"),
        recommendations: formData.get("recommendations"),
        notes: formData.get("notes"),
      }

      // Here you would typically send the data to your backend
      console.log("New checkup log:", logData)

      showNotification("Checkup log saved successfully!", "success")
      window.closeNewCheckupLogModal()

      // Optionally refresh the checkup logs table
      // refreshCheckupLogsTable()
    })
  }

  // Schedule view switching
  window.switchView = (view) => {
    const weekView = document.getElementById("week-view")
    const monthView = document.getElementById("month-view")
    const viewBtns = document.querySelectorAll(".view-btn")

    // Remove active class from all buttons
    viewBtns.forEach((btn) => btn.classList.remove("active"))

    // Add active class to clicked button
    document.querySelector(`[data-view="${view}"]`).classList.add("active")

    if (view === "week") {
      weekView.classList.add("active")
      monthView.classList.remove("active")
    } else {
      monthView.classList.add("active")
      weekView.classList.remove("active")
    }
  }

  // Schedule navigation
  window.previousPeriod = () => {
    showNotification("Previous period loaded", "info")
  }

  window.nextPeriod = () => {
    showNotification("Next period loaded", "info")
  }

  window.goToToday = () => {
    showNotification("Navigated to today", "info")
  }

  window.exportSchedule = () => {
    showNotification("Schedule exported successfully", "success")
  }

  window.viewEventDetails = (eventId) => {
    // Populate event details modal with specific event data
    document.getElementById("event-title").textContent = `Event Details - ${eventId}`
    openModal("event-details-modal")
  }

  window.closeEventDetailsModal = () => {
    closeModal("event-details-modal")
  }
})
