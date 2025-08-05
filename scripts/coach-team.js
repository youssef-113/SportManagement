// Coach Team Management JavaScript
document.addEventListener("DOMContentLoaded", () => {
  initializeTeamManagement()
  setupEventListeners()
  loadTeamData()
})

function initializeTeamManagement() {
  // Initialize formation view
  setupFormationInteractions()

  // Initialize squad filters
  setupSquadFilters()

  // Initialize player search
  setupPlayerSearch()
}

function setupEventListeners() {
  // Formation editing
  window.editFormation = () => {
    window.openFormationModal()
  }

  // Export team data
  window.exportTeamData = () => {
    exportTeamDataToCSV()
  }

  // Formation modal
  window.openFormationModal = () => {
    showFormationModal()
  }

  // Player profile viewing
  window.viewPlayerProfile = (playerId) => {
    showPlayerProfile(playerId)
  }

  // Player rating
  window.ratePlayer = (playerId) => {
    showRatingModal(playerId)
  }
}

function setupFormationInteractions() {
  const playerPositions = document.querySelectorAll(".player-position")

  playerPositions.forEach((position) => {
    position.addEventListener("click", function () {
      const playerName = this.querySelector(".player-name").textContent
      const playerNumber = this.querySelector(".player-number").textContent
      const positionType = this.dataset.position

      showPlayerPositionMenu(this, playerName, playerNumber, positionType)
    })

    // Add drag and drop functionality
    position.draggable = true
    position.addEventListener("dragstart", handleDragStart)
    position.addEventListener("dragover", handleDragOver)
    position.addEventListener("drop", handleDrop)
  })
}

function setupSquadFilters() {
  const positionFilter = document.getElementById("position-filter")
  const statusFilter = document.getElementById("status-filter")

  if (positionFilter) {
    positionFilter.addEventListener("change", function () {
      filterSquad("position", this.value)
    })
  }

  if (statusFilter) {
    statusFilter.addEventListener("change", function () {
      filterSquad("status", this.value)
    })
  }
}

function setupPlayerSearch() {
  const searchInput = document.getElementById("player-search")

  if (searchInput) {
    searchInput.addEventListener("input", function () {
      const searchTerm = this.value.toLowerCase()
      filterPlayersBySearch(searchTerm)
    })
  }
}

function loadTeamData() {
  // Simulate loading team data
  showLoadingState()

  setTimeout(() => {
    updateTeamStats()
    loadSquadPlayers()
    hideLoadingState()
  }, 1000)
}

function updateTeamStats() {
  // Update team statistics
  const stats = {
    attendance: "92%",
    rating: "8.4",
    injured: "3",
  }

  const statElements = document.querySelectorAll(".team-stats .stat-value")
  statElements.forEach((element, index) => {
    const values = Object.values(stats)
    if (values[index]) {
      animateStatValue(element, values[index])
    }
  })
}

function loadSquadPlayers() {
  // This would typically load from an API
  const players = [
    {
      id: 1,
      name: "Youssef Bassiony",
      position: "forward",
      jersey: "#11",
      rating: "9.2",
      attendance: "98%",
      status: "available",
      avatar: "https://images.unsplash.com/photo-1566753323558-f4e0952af115?w=60&h=60&fit=crop&crop=face",
    },
    {
      id: 2,
      name: "Ahmed Zizo",
      position: "midfielder",
      jersey: "#8",
      rating: "8.8",
      attendance: "95%",
      status: "available",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop&crop=face",
    },
    {
      id: 3,
      name: "Karim Fouad",
      position: "defender",
      jersey: "#4",
      rating: "8.6",
      attendance: "88%",
      status: "injured",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=60&h=60&fit=crop&crop=face",
    },
    {
      id: 4,
      name: "Hassan Ahmed",
      position: "goalkeeper",
      jersey: "#1",
      rating: "8.4",
      attendance: "100%",
      status: "available",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=60&h=60&fit=crop&crop=face",
    },
  ]

  // This would update the squad grid with actual data
  console.log("Squad players loaded:", players)
}

function filterSquad(filterType, filterValue) {
  const squadPlayers = document.querySelectorAll(".squad-player")

  squadPlayers.forEach((player) => {
    let shouldShow = true

    if (filterValue === "") {
      shouldShow = true
    } else if (filterType === "position") {
      const position = player.querySelector(".position").textContent.toLowerCase()
      shouldShow = position.includes(filterValue)
    } else if (filterType === "status") {
      shouldShow = player.classList.contains(filterValue)
    }

    player.style.display = shouldShow ? "flex" : "none"
  })
}

function filterPlayersBySearch(searchTerm) {
  const squadPlayers = document.querySelectorAll(".squad-player")

  squadPlayers.forEach((player) => {
    const playerName = player.querySelector("h4").textContent.toLowerCase()
    const shouldShow = playerName.includes(searchTerm)
    player.style.display = shouldShow ? "flex" : "none"
  })
}

function showPlayerPositionMenu(element, playerName, playerNumber, position) {
  // Create context menu for player position
  const menu = document.createElement("div")
  menu.className = "position-menu"
  menu.innerHTML = `
        <div class="menu-header">
            <strong>${playerName} ${playerNumber}</strong>
            <span class="position-type">${position}</span>
        </div>
        <div class="menu-actions">
            <button onclick="viewPlayerDetails('${playerName}')">View Details</button>
            <button onclick="substitutePlayer('${playerName}')">Substitute</button>
            <button onclick="changePosition('${playerName}')">Change Position</button>
        </div>
    `

  // Position the menu
  const rect = element.getBoundingClientRect()
  menu.style.cssText = `
        position: fixed;
        top: ${rect.bottom + 10}px;
        left: ${rect.left}px;
        background: white;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        padding: 12px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 1000;
        min-width: 200px;
    `

  document.body.appendChild(menu)

  // Remove menu when clicking outside
  setTimeout(() => {
    document.addEventListener("click", function removeMenu(e) {
      if (!menu.contains(e.target)) {
        document.body.removeChild(menu)
        document.removeEventListener("click", removeMenu)
      }
    })
  }, 100)
}

function handleDragStart(e) {
  e.dataTransfer.setData("text/plain", e.target.dataset.position)
  e.target.style.opacity = "0.5"
}

function handleDragOver(e) {
  e.preventDefault()
  e.target.style.backgroundColor = "rgba(220, 38, 38, 0.1)"
}

function handleDrop(e) {
  e.preventDefault()
  const draggedPosition = e.dataTransfer.getData("text/plain")
  const targetPosition = e.target.closest(".player-position")

  if (targetPosition && draggedPosition !== targetPosition.dataset.position) {
    // Swap players
    swapPlayerPositions(draggedPosition, targetPosition.dataset.position)
  }

  // Reset styles
  document.querySelectorAll(".player-position").forEach((pos) => {
    pos.style.opacity = "1"
    pos.style.backgroundColor = ""
  })
}

function swapPlayerPositions(pos1, pos2) {
  const position1 = document.querySelector(`[data-position="${pos1}"]`)
  const position2 = document.querySelector(`[data-position="${pos2}"]`)

  if (position1 && position2) {
    // Get player data
    const player1Data = {
      avatar: position1.querySelector(".position-avatar").src,
      name: position1.querySelector(".player-name").textContent,
      number: position1.querySelector(".player-number").textContent,
    }

    const player2Data = {
      avatar: position2.querySelector(".position-avatar").src,
      name: position2.querySelector(".player-name").textContent,
      number: position2.querySelector(".player-number").textContent,
    }

    // Swap the data
    position1.querySelector(".position-avatar").src = player2Data.avatar
    position1.querySelector(".player-name").textContent = player2Data.name
    position1.querySelector(".player-number").textContent = player2Data.number

    position2.querySelector(".position-avatar").src = player1Data.avatar
    position2.querySelector(".player-name").textContent = player1Data.name
    position2.querySelector(".player-number").textContent = player1Data.number

    showNotification("Players swapped successfully!", "success")
  }
}

function showFormationModal() {
  const modal = createModal(
    "Formation Settings",
    `
        <div class="formation-options">
            <h4>Select Formation</h4>
            <div class="formation-grid">
                <button class="formation-btn active" data-formation="4-3-3">4-3-3</button>
                <button class="formation-btn" data-formation="4-4-2">4-4-2</button>
                <button class="formation-btn" data-formation="3-5-2">3-5-2</button>
                <button class="formation-btn" data-formation="4-2-3-1">4-2-3-1</button>
            </div>
            <div class="formation-actions">
                <button class="btn-outline" onclick="closeModal()">Cancel</button>
                <button class="btn-primary" onclick="applyFormation()">Apply Formation</button>
            </div>
        </div>
    `,
  )

  // Setup formation button interactions
  const formationBtns = modal.querySelectorAll(".formation-btn")
  formationBtns.forEach((btn) => {
    btn.addEventListener("click", function () {
      formationBtns.forEach((b) => b.classList.remove("active"))
      this.classList.add("active")
    })
  })
}

function exportTeamDataToCSV() {
  // Simulate CSV export
  const csvData = [
    ["Name", "Position", "Jersey", "Rating", "Attendance", "Status"],
    ["Youssef Bassiony", "Forward", "#11", "9.2", "98%", "Available"],
    ["Ahmed Zizo", "Midfielder", "#8", "8.8", "95%", "Available"],
    ["Karim Fouad", "Defender", "#4", "8.6", "88%", "Injured"],
    ["Hassan Ahmed", "Goalkeeper", "#1", "8.4", "100%", "Available"],
  ]

  const csvContent = csvData.map((row) => row.join(",")).join("\n")
  const blob = new Blob([csvContent], { type: "text/csv" })
  const url = window.URL.createObjectURL(blob)

  const a = document.createElement("a")
  a.href = url
  a.download = "team-data.csv"
  a.click()

  window.URL.revokeObjectURL(url)
  showNotification("Team data exported successfully!", "success")
}

function showPlayerProfile(playerId) {
  // This would show detailed player profile
  showNotification(`Viewing profile for player ${playerId}`, "info")
}

function showRatingModal(playerId) {
  const modal = createModal(
    "Rate Player",
    `
        <div class="rating-form">
            <h4>Rate Player Performance</h4>
            <div class="rating-categories">
                <div class="rating-item">
                    <label>Technical Skills</label>
                    <div class="star-rating" data-category="technical">
                        ${createStarRating()}
                    </div>
                </div>
                <div class="rating-item">
                    <label>Physical Fitness</label>
                    <div class="star-rating" data-category="physical">
                        ${createStarRating()}
                    </div>
                </div>
                <div class="rating-item">
                    <label>Tactical Awareness</label>
                    <div class="star-rating" data-category="tactical">
                        ${createStarRating()}
                    </div>
                </div>
            </div>
            <textarea placeholder="Additional comments..." rows="3"></textarea>
            <div class="rating-actions">
                <button class="btn-outline" onclick="closeModal()">Cancel</button>
                <button class="btn-primary" onclick="submitRating(${playerId})">Submit Rating</button>
            </div>
        </div>
    `,
  )

  setupStarRatings(modal)
}

function createStarRating() {
  return Array.from({ length: 5 }, (_, i) => `<i class="fas fa-star" data-rating="${i + 1}"></i>`).join("")
}

function setupStarRatings(modal) {
  const starRatings = modal.querySelectorAll(".star-rating")

  starRatings.forEach((rating) => {
    const stars = rating.querySelectorAll(".fas.fa-star")

    stars.forEach((star, index) => {
      star.addEventListener("click", () => {
        const ratingValue = index + 1

        // Update visual state
        stars.forEach((s, i) => {
          s.style.color = i < ratingValue ? "#fbbf24" : "#e5e7eb"
        })

        // Store rating value
        rating.dataset.value = ratingValue
      })
    })
  })
}

function animateStatValue(element, targetValue) {
  // Simple animation for stat values
  element.style.transform = "scale(1.1)"
  element.textContent = targetValue

  setTimeout(() => {
    element.style.transform = "scale(1)"
  }, 200)
}

function showLoadingState() {
  const cards = document.querySelectorAll(".squad-player, .formation-view")
  cards.forEach((card) => {
    card.style.opacity = "0.6"
  })
}

function hideLoadingState() {
  const cards = document.querySelectorAll(".squad-player, .formation-view")
  cards.forEach((card) => {
    card.style.opacity = "1"
  })
}

// Utility functions
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
