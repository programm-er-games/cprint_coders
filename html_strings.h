String login = R"rawliteral(
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Login</title>
  <style>
    body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; background-color: #f5f5f5; }
    .login-container { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1); width: 300px; }
    .login-container h1 { font-size: 24px; margin-bottom: 20px; text-align: center; }
    .form-group { margin-bottom: 15px; }
    .form-group label { display: block; margin-bottom: 5px; }
    .form-group input { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; }
    .form-group button { width: 100%; padding: 10px; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer; }
    .form-group button:hover { background: #45a049; }
  </style>
</head>
<body>
  <div class="login-container">
    <h1>Login</h1>
    <form id="login-form">
      <div class="form-group">
        <label for="username">Login</label>
        <input type="text" id="username" name="username" placeholder="Enter your login">
      </div>
      <div class="form-group">
        <label for="password">Password</label>
        <input type="password" id="password" name="password" placeholder="Enter your password">
      </div>
      <div class="form-group">
        <button type="button" onclick="submitLogin()">Sign In</button>
      </div>
    </form>
  </div>
  <script>
    function submitLogin() {
      const username = document.getElementById("username").value;
      const password = document.getElementById("password").value;

      fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `username=${username}&password=${password}`
      })
      .then(response => {
        if (response.ok) {
          window.location.href = '/main';
        } else {
          alert("Login failed. Please try again.");
        }
      });
    }
  </script>
</body>
</html>
)rawliteral";

String main_page = R"rawliteral(
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Main Page</title>
  <style>
    body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; background-color: #f5f5f5; }
    .slider-container { text-align: center; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1); width: 300px; }
    .slider-container h1 { font-size: 24px; margin-bottom: 20px; }
    .slider-container input[type="range"] { width: 100%; }
    .slider-labels { display: flex; justify-content: space-between; }
  </style>
</head>
<body>
  <div class="slider-container">
    <h1>Brightness Control</h1>
    <div class="slider-labels"><span>0%</span><span>100%</span></div>
    <input type="range" id="brightness-slider" min="0" max="100" value="50" oninput="updateBrightness(this.value)">
    <p>Brightness: <span id="brightness-value">50</span>%</p>
  </div>
  <script>
    function updateBrightness(value) {
      document.getElementById("brightness-value").textContent = value;
      fetch('/setBrightness', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `brightness=${value}`
      });
    }
  </script>
</body>
</html>
)rawliteral";