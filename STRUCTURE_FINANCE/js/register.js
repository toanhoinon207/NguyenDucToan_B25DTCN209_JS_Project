let currentUser = JSON.parse(localStorage.getItem("currentUser"));
if(currentUser){
    window.location.href = "../index.html";
}  

const form = document.querySelector(".auth-form");
const emailEl = document.getElementById('email');
const passEl = document.getElementById('password');
const rePassEl = document.getElementById('re-password');
const emailInput = emailEl.querySelector('input');
const passInput = passEl.querySelector('input');
const rePassInput = rePassEl.querySelector('input');
let users = JSON.parse(localStorage.getItem("users")) || [];

function showError(group, warning) {
    group.classList.add("error");
    group.querySelector("small").innerText = warning;
}

function clearError(group) {
    group.classList.remove("error");
    group.querySelector("small").innerText = "";
}

emailInput.addEventListener("click", () => {
    clearError(emailEl);
});

passInput.addEventListener("click", () => {
    clearError(passEl);
});

rePassInput.addEventListener("click", () => {
    clearError(rePassEl);
});

function isEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function accountRegister() {
    let isValidation = true;
    const email = emailInput.value.trim();
    const password = passInput.value.trim();
    const rePassword = rePassInput.value.trim();
    if (email === "") {
        showError(emailEl, "Please enter your email ...");
        isValidation = false;
    } else if (!isEmail(email)) {
        showError(emailEl, "The email is not in the correct format");
        isValidation = false;
    } else {
        clearError(emailEl);
    }
    if (password === "") {
        showError(passEl, "Please enter your password ...");
        isValidation = false;
    } else if (password.length < 6) {
        showError(passEl, "The password must have at least 6 characters");
        isValidation = false;
    } else {
        clearError(passEl);
    }
    if (rePassword === "") {
        showError(rePassEl, "Please enter your confirm password ...");
        isValidation = false;
    } else if (rePassword !== password) {
        showError(rePassEl, "The confirm password is incorrect");
        isValidation = false;
    } else {
        clearError(rePassEl);
    }
    const isExist = users.some(user => user.email === email);
    if (isExist) {
        showError(emailEl, "The email already exists.");
        isValidation = false;
    }
    if (isValidation) {
        const newUser = {
            id: users.length > 0 ? users[users.length - 1].id + 1 : 1,
            email: email,
            password: password,
            phone: "",
            gender: "",
            status: true
        };
        users.push(newUser);
        localStorage.setItem("users", JSON.stringify(users));
        document.querySelector(".success").style.display = "block";
        window.location.href = "./login.html";
    }
}