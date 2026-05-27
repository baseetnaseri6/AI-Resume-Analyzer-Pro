const loginForm = document.getElementById("loginForm");
const themeBtn = document.getElementById("themeBtn");
const messageBox = document.getElementById("messageBox");

themeBtn.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");

  themeBtn.innerHTML = document.body.classList.contains("dark-mode")
    ? `<i class="bi bi-sun-fill"></i>`
    : `<i class="bi bi-moon-stars-fill"></i>`;
});

loginForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if(email === "demo@example.com" && password === "123456"){
    localStorage.setItem("loggedIn", "true");
    localStorage.setItem("full_name", "Demo User");

    messageBox.style.color = "#22c55e";
    messageBox.innerHTML = "✅ Login successful";

    setTimeout(() => {
      window.location.href = "dashboard.html";
    }, 600);
  }else{
    messageBox.style.color = "#ef4444";
    messageBox.innerHTML = "❌ Use demo@example.com / 123456";
  }
});