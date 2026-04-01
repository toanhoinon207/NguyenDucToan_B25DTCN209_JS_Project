const form = document.querySelector(".auth-form");
const emailEl = document.getElementById("email");
const passEl = document.getElementById("password");
const emailInput = emailEl.querySelector("input");
const passInput = passEl.querySelector("input");
let users = JSON.parse(localStorage.getItem("users")) || [];
function showError(group, warning) {
    group.classList.add("error");
    group.querySelector(".error").innerText = warning;
}

function clearError(group) {
    group.classList.remove("error");
    group.querySelector(".error").innerText = "";
}

function accountLogin() {
    let isValidation = true;
    const email = emailInput.value.trim();
    const password = passInput.value.trim();
    if (email === "") {
        showError(emailEl, "Please enter your email ...");
        isValidation = false;
    } else {
        clearError(emailEl);
    }
    if (password === "") {
        showError(passEl, "Please enter your password ...");
        isValidation = false;
    } else {
        clearError(passEl);
    }
    if (!isValidation){
        return;
    }
    const user = users.find(user => user.email === email && user.password === password);
    if (!user) {
        showError(emailEl, "Incorrect email or password ...");
        showError(passEl, "");
        return;
    }
    localStorage.setItem("currentUser", JSON.stringify(user));
    alert("Đăng nhập thành công!");
    window.location.href = "../index.html";
}