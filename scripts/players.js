// Players page functionality
document.addEventListener("DOMContentLoaded", () => {
  // Team selection
  window.changeTeam = () => {
    const teamSelect = document.getElementById("team-select")
    const selectedTeam = teamSelect.value
    showNotification(`Switched to ${teamSelect.options[teamSelect.selectedIndex].text}`, "info")

    // Here you would typically reload player data for the selected team
    showLoading(document.querySelector(".players-grid"))
    setTimeout(() => {
      hideLoading(document.querySelector(".players-grid"))
    }, 1000)
  }

  // Filter functionality
  const filters = document.querySelectorAll(".player-filters select")
  filters.forEach((filter) => {
    filter.addEventListener("change", () => {
      applyPlayerFilters()
    })
  })

  function applyPlayerFilters() {
    const positionFilter = document.getElementById("position-filter").value
    const statusFilter = document.getElementById("status-filter").value
    const ageFilter = document.getElementById("age-filter").value

    const playerCards = document.querySelectorAll(".player-card")

    playerCards.forEach((card) => {
      let show = true

      // Check position filter
      if (positionFilter) {
        const position = card.querySelector(".position").textContent.toLowerCase()
        if (!position.includes(positionFilter.toLowerCase())) {
          show = false
        }
      }

      // Check status filter
      if (statusFilter) {
        const status = card.querySelector(".player-status")
        if (!status.classList.contains(statusFilter)) {
          show = false
        }
      }

      card.style.display = show ? "block" : "none"
    })
  }

  window.clearPlayerFilters = () => {
    filters.forEach((filter) => {
      filter.value = ""
    })
    applyPlayerFilters()
  }

  // Player actions
  window.viewPlayerDetails = (playerId) => {
    // Populate modal with player data
    document.getElementById("player-details-title").textContent = `Player ${playerId} Details`
    openModal("player-details-modal")
  }

  window.editPlayerPerformance = (playerId) => {
    showNotification(`Editing performance for player ${playerId}`, "info")
  }

  window.editPlayerAttendance = (playerId) => {
    showNotification(`Editing attendance for player ${playerId}`, "info")
  }

  window.leaveFeedback = (playerId) => {
    openModal("feedback-modal")
  }

  window.closePlayerDetailsModal = () => {
    closeModal("player-details-modal")
  }

  // Tab functionality in player details modal
  const tabBtns = document.querySelectorAll(".player-details-tabs .tab-btn")
  const tabContents = document.querySelectorAll(".tab-content")

  tabBtns.forEach((btn) => {
    btn.addEventListener("click", function () {
      const targetTab = this.getAttribute("data-tab")

      // Remove active class from all tabs and contents
      tabBtns.forEach((tab) => tab.classList.remove("active"))
      tabContents.forEach((content) => content.classList.remove("active"))

      // Add active class to clicked tab and corresponding content
      this.classList.add("active")
      document.getElementById(targetTab + "-tab").classList.add("active")
    })
  })

  // Add player modal
  window.openAddPlayerModal = () => {
    openModal("add-player-modal")
  }

  window.closeAddPlayerModal = () => {
    closeModal("add-player-modal")
  }

  // Feedback modal
  window.closeFeedbackModal = () => {
    closeModal("feedback-modal")
  }

  // Rating functionality
  const ratingStars = document.querySelectorAll(".rating-input i")
  let selectedRating = 0

  ratingStars.forEach((star, index) => {
    star.addEventListener("click", () => {
      selectedRating = index + 1
      updateRatingDisplay()
    })

    star.addEventListener("mouseover", () => {
      highlightStars(index + 1)
    })
  })

  document.querySelector(".rating-input").addEventListener("mouseleave", () => {
    updateRatingDisplay()
  })

  function highlightStars(rating) {
    ratingStars.forEach((star, index) => {
      if (index < rating) {
        star.classList.add("active")
      } else {
        star.classList.remove("active")
      }
    })
  }

  function updateRatingDisplay() {
    highlightStars(selectedRating)
  }

  // Performance metrics editing
  window.editPerformanceMetrics = () => {
    showNotification("Performance metrics updated", "success")
  }

  window.editAttendanceRecord = () => {
    showNotification("Attendance record updated", "success")
  }

  window.addNewFeedback = () => {
    openModal("feedback-modal")
  }

  // Export functionality
  window.exportPlayers = () => {
    showNotification("Player data exported successfully", "success")
  }

  // Search functionality
  const searchInput = document.getElementById("player-search")
  if (searchInput) {
    searchInput.addEventListener("input", function () {
      const searchTerm = this.value.toLowerCase()
      const playerCards = document.querySelectorAll(".player-card")

      playerCards.forEach((card) => {
        const playerName = card.querySelector("h3").textContent.toLowerCase()
        const position = card.querySelector(".position").textContent.toLowerCase()

        if (playerName.includes(searchTerm) || position.includes(searchTerm)) {
          card.style.display = "block"
          card.classList.add("highlighted")
        } else {
          card.style.display = "none"
          card.classList.remove("highlighted")
        }
      })
    })
  }

  // Declare variables before using them
  function showNotification(message, type) {
    console.log(`Notification: ${message} (Type: ${type})`)
  }

  function showLoading(element) {
    element.classList.add("loading")
  }

  function hideLoading(element) {
    element.classList.remove("loading")
  }

  function openModal(modalId) {
    document.getElementById(modalId).style.display = "block"
  }

  function closeModal(modalId) {
    document.getElementById(modalId).style.display = "none"
  }
})
