// Drills page functionality
document.addEventListener("DOMContentLoaded", () => {
  // Category filtering
  const categoryBtns = document.querySelectorAll(".category-btn")
  categoryBtns.forEach((btn) => {
    btn.addEventListener("click", function () {
      const category = this.getAttribute("data-category")

      // Remove active class from all buttons
      categoryBtns.forEach((categoryBtn) => categoryBtn.classList.remove("active"))

      // Add active class to clicked button
      this.classList.add("active")

      // Filter drills based on category
      filterDrillsByCategory(category)
    })
  })

  function filterDrillsByCategory(category) {
    const drillCards = document.querySelectorAll(".drill-card")

    drillCards.forEach((card) => {
      if (category === "all") {
        card.style.display = "block"
      } else {
        // This would typically check against data attributes or classes
        card.style.display = "block" // Simplified for demo
      }
    })
  }

  // Search functionality
  const searchInput = document.getElementById("drill-search")
  if (searchInput) {
    searchInput.addEventListener("input", function () {
      const searchTerm = this.value.toLowerCase()
      const drillCards = document.querySelectorAll(".drill-card")

      drillCards.forEach((card) => {
        const title = card.querySelector("h3").textContent.toLowerCase()
        const description = card.querySelector(".drill-description").textContent.toLowerCase()

        if (title.includes(searchTerm) || description.includes(searchTerm)) {
          card.style.display = "block"
          card.classList.add("highlighted")
        } else {
          card.style.display = "none"
          card.classList.remove("highlighted")
        }
      })
    })
  }

  // Filter functionality
  const filters = document.querySelectorAll(".drills-filters select")
  filters.forEach((filter) => {
    filter.addEventListener("change", () => {
      applyDrillFilters()
    })
  })

  function applyDrillFilters() {
    const sportFilter = document.getElementById("sport-filter").value
    const typeFilter = document.getElementById("type-filter").value
    const difficultyFilter = document.getElementById("difficulty-filter").value
    const durationFilter = document.getElementById("duration-filter").value

    const drillCards = document.querySelectorAll(".drill-card")

    drillCards.forEach((card) => {
      let show = true

      // Check sport filter
      if (sportFilter) {
        const sportTag = card.querySelector(`.tag.${sportFilter}`)
        if (!sportTag) show = false
      }

      // Check type filter
      if (typeFilter) {
        const typeTag = card.querySelector(`.tag.${typeFilter}`)
        if (!typeTag) show = false
      }

      // Check difficulty filter
      if (difficultyFilter) {
        const difficultyTag = card.querySelector(`.tag.${difficultyFilter}`)
        if (!difficultyTag) show = false
      }

      card.style.display = show ? "block" : "none"
    })
  }

  window.clearDrillFilters = () => {
    filters.forEach((filter) => {
      filter.value = ""
    })
    applyDrillFilters()
  }

  // Drill actions
  window.viewDrill = (drillId) => {
    // Populate modal with drill data
    document.getElementById("drill-detail-title").textContent = `Drill ${drillId} Details`
    window.openModal("drill-detail-modal")
  }

  window.assignDrill = (drillId) => {
    window.showNotification(`Drill ${drillId} assigned to session`, "success")
  }

  window.editDrill = (drillId) => {
    window.showNotification(`Editing drill ${drillId}`, "info")
  }

  window.closeDrillDetailModal = () => {
    window.closeModal("drill-detail-modal")
  }

  // Favorite functionality
  document.querySelectorAll(".favorite-btn").forEach((btn) => {
    btn.addEventListener("click", function (e) {
      e.stopPropagation()
      this.classList.toggle("active")

      const icon = this.querySelector("i")
      if (this.classList.contains("active")) {
        icon.className = "fas fa-heart"
        window.showNotification("Added to favorites", "success")
      } else {
        icon.className = "far fa-heart"
        window.showNotification("Removed from favorites", "info")
      }
    })
  })

  // New drill modal
  window.openNewDrillModal = () => {
    window.openModal("new-drill-modal")
  }

  window.closeNewDrillModal = () => {
    window.closeModal("new-drill-modal")
  }

  // Load more functionality
  window.loadMoreDrills = () => {
    const loadBtn = document.querySelector(".load-more button")
    loadBtn.classList.add("loading")

    // Simulate loading more drills
    setTimeout(() => {
      loadBtn.classList.remove("loading")
      window.showNotification("More drills loaded", "success")
    }, 1500)
  }

  // Drill detail modal actions
  window.favoriteDrill = () => {
    window.showNotification("Drill added to favorites", "success")
  }

  window.duplicateDrill = () => {
    window.showNotification("Drill duplicated", "success")
  }

  window.assignDrillToSession = () => {
    window.showNotification("Drill assigned to session", "success")
    window.closeModal("drill-detail-modal")
  }

  // Declare openModal, showNotification, and closeModal functions
  window.openModal = (modalId) => {
    // Implementation for opening a modal
    document.getElementById(modalId).style.display = "block"
  }

  window.showNotification = (message, type) => {
    // Implementation for showing a notification
    console.log(`${type}: ${message}`)
  }

  window.closeModal = (modalId) => {
    // Implementation for closing a modal
    document.getElementById(modalId).style.display = "none"
  }
})
