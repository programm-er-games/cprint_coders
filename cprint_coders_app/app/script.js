document.getElementById("login-button").addEventListener("click", function(event) {
  event.preventDefault(); // Prevent form submission

  const email = document.getElementById("mail").value;
  const password = document.getElementById("password").value;
  const notice = document.getElementById("notice");
  const noticeText = document.getElementById("notice-text");

  if (!email || !password) {
    // Show warning notification for empty fields
    showNotification(notice, noticeText, "warning", "Незаполненные поля");
  } else if (email === "user@example.com" && password === "userpass") {
    // Show success notification for correct login and redirect
    showNotification(notice, noticeText, "success", "Успешный вход в систему, пользователь");
    setTimeout(() => {
      window.location.href = "../page/base.html"; // Redirect after a delay
    }, 2000);
  } else if (email === "admin@example.com" && password === "password") {
    // Show success notification for correct login and redirect to another page
    showNotification(notice, noticeText, "success", "Успешный вход в систему, админ");
    setTimeout(() => {
      window.location.href = "../admin_page/base.html"; // Redirect to a different page after a delay
    }, 2000);
  } else {
    // Show error notification for incorrect login
    showNotification(notice, noticeText, "error", "Ошибка: неправильный логин и пароль");
  }
  
});

function showNotification(notice, noticeText, type, message) {
  notice.className = `notice ${type}`;
  noticeText.textContent = message;
  notice.style.display = "flex";

  setTimeout(() => {
    notice.style.display = "none";
  }, 3000);
}

