// Schedule page functionality
document.addEventListener("DOMContentLoaded", () => {
  // View toggle functionality
  const viewBtns = document.querySelectorAll(".view-btn")
  const scheduleViews = document.querySelectorAll(".schedule-view")

  viewBtns.forEach((btn) => {
    btn.addEventListener("click", function () {
      const targetView = this.getAttribute("data-view")

      // Remove active class from all buttons and views
      viewBtns.forEach((viewBtn) => viewBtn.classList.remove("active"))
      scheduleViews.forEach((view) => view.classList.remove("active"))

      // Add active class to clicked button and corresponding view
      this.classList.add("active")
      document.querySelector(`.${targetView}-view`).classList.add("active")
    })
  })

  // Calendar navigation
  let currentWeek = new Date()

  window.previousWeek = () => {
    currentWeek.setDate(currentWeek.getDate() - 7)
    updateCalendarHeader()
  }

  window.nextWeek = () => {
    currentWeek.setDate(currentWeek.getDate() + 7)
    updateCalendarHeader()
  }

  window.goToToday = () => {
    currentWeek = new Date()
    updateCalendarHeader()
  }

  function updateCalendarHeader() {
    const startOfWeek = new Date(currentWeek)
    startOfWeek.setDate(currentWeek.getDate() - currentWeek.getDay() + 1)
    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 6)

    const options = { month: "long", day: "numeric" }
    const startStr = startOfWeek.toLocaleDateString("en-US", options)
    const endStr = endOfWeek.toLocaleDateString("en-US", options)
    const year = currentWeek.getFullYear()

    document.getElementById("current-week").textContent = `${startStr} - ${endStr}, ${year}`
  }

  // Filter functionality
  const filters = document.querySelectorAll(".schedule-filters select")
  filters.forEach((filter) => {
    filter.addEventListener("change", () => {
      applyFilters()
    })
  })

  function applyFilters() {
    const sportFilter = document.getElementById("sport-filter").value
    const teamFilter = document.getElementById("team-filter").value
    const statusFilter = document.getElementById("status-filter").value

    const sessionCards = document.querySelectorAll(".session-card")
    const sessionBlocks = document.querySelectorAll(".session-block")

    // Filter session cards in list view
    sessionCards.forEach((card) => {
      let show = true

      if (sportFilter && !card.querySelector(`.session-sport.${sportFilter}`)) {
        show = false
      }
      if (statusFilter && !card.querySelector(`.session-status.${statusFilter}`)) {
        show = false
      }

      card.style.display = show ? "block" : "none"
    })

    // Filter session blocks in calendar view
    sessionBlocks.forEach((block) => {
      let show = true

      if (sportFilter && !block.classList.contains(sportFilter)) {
        show = false
      }

      block.style.display = show ? "flex" : "none"
    })
  }

  window.clearFilters = () => {
    filters.forEach((filter) => {
      filter.value = ""
    })
    applyFilters()
  }

  // Session actions
  window.editSession = (sessionId) => {
    showNotification(`Editing session ${sessionId}`, "info")
    // Here you would typically open an edit modal
  }

  window.deleteSession = (sessionId) => {
    if (confirm("Are you sure you want to delete this session?")) {
      showNotification(`Session ${sessionId} deleted`, "success")
      // Here you would typically remove the session from the DOM
    }
  }

  window.viewSession = (sessionId) => {
    showNotification(`Viewing session ${sessionId}`, "info")
    // Here you would typically open a view modal
  }

  // New session modal
  window.openNewSessionModal = () => {
    openModal("new-session-modal")
  }

  window.closeNewSessionModal = () => {
    closeModal("new-session-modal")
  }

  // Session block click handlers
  document.querySelectorAll(".session-block").forEach((block) => {
    block.addEventListener("click", function () {
      const title = this.querySelector(".session-title").textContent
      showNotification(`Clicked on: ${title}`, "info")
    })
  })

  // Initialize calendar
  updateCalendarHeader()

  // Declare variables before using them
  function showNotification(message, type) {
    console.log(`${type}: ${message}`)
  }

  function openModal(modalId) {
    document.getElementById(modalId).style.display = "block"
  }

  function closeModal(modalId) {
    document.getElementById(modalId).style.display = "none"
  }
})
