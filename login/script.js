document.getElementById("loginForm").addEventListener("submit", function(e) {
  e.preventDefault();

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  const errorMessage = document.getElementById("error-message");

  // Simulação de login
  const userFake = "admin";
  const passFake = "12345";

  if (username === userFake && password === passFake) {
    errorMessage.style.color = "green";
    errorMessage.textContent = "Login realizado com sucesso!";
    setTimeout(() => {
      window.location.href = ""; // redireciona para outra página
    }, 1500);
  } else {
    errorMessage.style.color = "red";
    errorMessage.textContent = "Usuário ou senha incorretos!";
  }
});
