// Login page functionality
document.addEventListener("DOMContentLoaded", () => {
  // Tab switching
  const tabBtns = document.querySelectorAll(".tab-btn")
  const loginForms = document.querySelectorAll(".login-form")

  tabBtns.forEach((btn) => {
    btn.addEventListener("click", function () {
      const targetTab = this.getAttribute("data-tab")

      // Remove active class from all tabs and forms
      tabBtns.forEach((tab) => tab.classList.remove("active"))
      loginForms.forEach((form) => form.classList.remove("active"))

      // Add active class to clicked tab and corresponding form
      this.classList.add("active")
      document.getElementById(targetTab + "-form").classList.add("active")
    })
  })

  // Password toggle functionality
  window.togglePassword = (inputId) => {
    const input = document.getElementById(inputId)
    const icon = input.nextElementSibling

    if (input.type === "password") {
      input.type = "text"
      icon.classList.remove("fa-eye")
      icon.classList.add("fa-eye-slash")
    } else {
      input.type = "password"
      icon.classList.remove("fa-eye-slash")
      icon.classList.add("fa-eye")
    }
  }

  // Forgot password modal
  window.showForgotPassword = () => {
    document.getElementById("forgot-password-modal").style.display = "flex"
    document.getElementById("forgot-password-modal").classList.add("active")
  }

  window.closeForgotPassword = () => {
    const modal = document.getElementById("forgot-password-modal")
    modal.classList.remove("active")
    setTimeout(() => {
      modal.style.display = "none"
    }, 200)
  }

  // Notification function declaration
  function showNotification(message, type) {
    const notification = document.createElement("div")
    notification.classList.add("notification", type)
    notification.textContent = message
    document.body.appendChild(notification)

    setTimeout(() => {
      document.body.removeChild(notification)
    }, 3000)
  }

  // Form submissions
  document.getElementById("login-form").addEventListener("submit", function (e) {
    e.preventDefault()

    // Show loading state
    const submitBtn = this.querySelector('button[type="submit"]')
    submitBtn.classList.add("loading")

    // Simulate login process
    setTimeout(() => {
      submitBtn.classList.remove("loading")
      // Redirect to dashboard
      window.location.href = "dashboard.html"
    }, 2000)
  })

  document.getElementById("signup-form").addEventListener("submit", function (e) {
    e.preventDefault()

    const password = document.getElementById("signup-password").value
    const confirmPassword = document.getElementById("confirm-password").value

    if (password !== confirmPassword) {
      showNotification("Passwords do not match!", "error")
      return
    }

    // Show loading state
    const submitBtn = this.querySelector('button[type="submit"]')
    submitBtn.classList.add("loading")

    // Simulate signup process
    setTimeout(() => {
      submitBtn.classList.remove("loading")
      showNotification("Account created successfully!", "success")
      // Switch to login tab
      document.querySelector('[data-tab="login"]').click()
    }, 2000)
  })

  document.getElementById("forgot-password-form").addEventListener("submit", function (e) {
    e.preventDefault()

    // Show loading state
    const submitBtn = this.querySelector('button[type="submit"]')
    submitBtn.classList.add("loading")

    // Simulate password reset
    setTimeout(() => {
      submitBtn.classList.remove("loading")
      showNotification("Password reset link sent to your email!", "success")
      window.closeForgotPassword()
    }, 2000)
  })
})
