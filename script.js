// ---------------------------
// USERS LOGIN/REGISTER
// ---------------------------
document.getElementById("loginForm")?.addEventListener("submit", function(event) {
  event.preventDefault();

  const username = document.getElementById("loginUsername").value;
  const password = document.getElementById("loginPassword").value;

  // Dummy login check (you can change later)
  if (username === "admin" && password === "123") {
      window.location.href = "index.html"; // ✅ Redirect to main page
  } else {
      document.getElementById("loginErrorMsg").innerHTML = "Invalid credentials!";
  }
});

function login() {
  let user = document.getElementById("username").value;
  let pass = document.getElementById("password").value;

  if(user === "" || pass === "") {
    alert("Enter both fields");
  } else {
    localStorage.setItem("user", user);
    location.href = "index.html";
  }
}

function logout() {
  localStorage.removeItem("user");
  location.href = "front.html";
}

function loadUsers() {
  const stored = localStorage.getItem('users');
  if (stored) {
    try { return JSON.parse(stored); } 
    catch { return []; }
  }
  return [{ username: "farmer", password: "12345" }];
}

function saveUsers(users) {
  localStorage.setItem('users', JSON.stringify(users));
}

let users = loadUsers();

const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const showLoginBtn = document.getElementById('showLogin');
const showRegisterBtn = document.getElementById('showRegister');
const loginErrorMsg = document.getElementById('loginErrorMsg');
const registerErrorMsg = document.getElementById('registerErrorMsg');
const registerSuccessMsg = document.getElementById('registerSuccessMsg');

if (showLoginBtn && showRegisterBtn) {
  showLoginBtn.addEventListener('click', () => {
    loginForm.style.display = 'block';
    registerForm.style.display = 'none';
    showLoginBtn.classList.add('btn-success');
    showLoginBtn.classList.remove('btn-outline-success');
    showRegisterBtn.classList.add('btn-outline-success');
    showRegisterBtn.classList.remove('btn-success');
  });

  showRegisterBtn.addEventListener('click', () => {
    loginForm.style.display = 'none';
    registerForm.style.display = 'block';
    showRegisterBtn.classList.add('btn-success');
    showRegisterBtn.classList.remove('btn-outline-success');
    showLoginBtn.classList.add('btn-outline-success');
    showLoginBtn.classList.remove('btn-success');
  });
}

if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value.trim();
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
      localStorage.setItem('loggedInUser', username); // save session
      window.location.href = 'index.html';
    } else loginErrorMsg.textContent = 'Invalid username or password.';
  });
}

if (registerForm) {
  registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('regUsername').value.trim();
    const password = document.getElementById('regPassword').value.trim();
    const confirmPassword = document.getElementById('regConfirmPassword').value.trim();

    if (!username || !password || !confirmPassword) {
      registerErrorMsg.textContent = 'Please fill in all fields.'; return;
    }
    if (password !== confirmPassword) {
      registerErrorMsg.textContent = 'Passwords do not match.'; return;
    }
    if (users.find(u => u.username.toLowerCase() === username.toLowerCase())) {
      registerErrorMsg.textContent = 'Username already exists.'; return;
    }

    users.push({ username, password });
    saveUsers(users);
    registerSuccessMsg.textContent = 'Registration successful! Redirecting to login...';
    setTimeout(() => showLoginBtn.click(), 2000);
  });
}

// ---------------------------
// CHECK LOGIN SESSION
// ---------------------------
const loggedInUser = localStorage.getItem('loggedInUser');
if (!loggedInUser && document.getElementById('mainContent')) {
  window.location.href = 'login.html';
}

// ---------------------------
// LOGOUT BUTTON
// ---------------------------
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('loggedInUser');
    window.location.href = 'login.html';
  });
}

// ---------------------------
// LIVE WEATHER ADVISORY
// ---------------------------
const apiKey = "e88286488052b827c8e67eee54534b4b";

async function getWeather(location) {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${apiKey}&units=metric`
    );
    if (!response.ok) throw new Error("Location not found");
    const data = await response.json();
    const rain = data.rain ? data.rain["1h"] || 0 : 0;
    const temp = data.main.temp;
    return { rain, temp };
  } catch (err) {
    console.error(err);
    return { rain: 0, temp: null };
  }
}

const suggestionDiv = document.getElementById('suggestion');
const dateInput = document.getElementById('date');
const activityButtons = document.querySelectorAll('.btn-success[data-activity]');

if (activityButtons) {
  const today = new Date().toISOString().split("T")[0];
  if (dateInput) dateInput.min = today;

  activityButtons.forEach(button => {
    button.addEventListener('click', async () => {
      const location = document.getElementById('location').value.trim();
      const dateValue = dateInput.value;
      const activity = button.dataset.activity;

      if (!location || !dateValue) {
        suggestionDiv.textContent = 'Please enter all details.';
        suggestionDiv.className = 'alert alert-danger text-center d-block mt-3';
        return;
      }

      suggestionDiv.textContent = 'Fetching live weather data...';
      suggestionDiv.className = 'alert alert-info text-center d-block mt-3';

      const weather = await getWeather(location);
      if (!weather) {
        suggestionDiv.textContent = 'Unable to fetch weather for this location.';
        suggestionDiv.className = 'alert alert-warning text-center d-block mt-3';
        return;
      }

      const rain = weather.rain;
      const temp = weather.temp;
      let advice = '';
      let alertClass = 'alert-success';

      if (activity === 'sowing') {
        if (rain >= 5) advice = `Heavy rain (${rain}mm): good for sowing.`;
        else if (rain > 0) advice = `Light rain (${rain}mm): suitable for sowing.`;
        else advice = `No rain: irrigation may be needed.`;
        alertClass = 'alert-success';
      } else if (activity === 'harvesting') {
        if (rain > 0) {
          advice = `Rain (${rain}mm): avoid harvesting.`;
          alertClass = 'alert-warning';
        } else {
          advice = `No rain: good day for harvesting.`;
          alertClass = 'alert-success';
        }
      } else if (activity === 'irrigation') {
        if (rain >= 5) {
          advice = `Heavy rain (${rain}mm): skip irrigation.`;
          alertClass = 'alert-info';
        } else if (rain > 0) {
          advice = `Light rain (${rain}mm): reduce irrigation.`;
          alertClass = 'alert-info';
        } else {
          advice = `No rain: irrigation recommended.`;
          alertClass = 'alert-success';
        }
      }

      // Update suggestion box properly
      suggestionDiv.innerHTML = `<strong>${advice}</strong><br>Temperature: ${temp}°C`;
      suggestionDiv.className = `alert ${alertClass} text-center d-block mt-3`;
    });
  });
}
