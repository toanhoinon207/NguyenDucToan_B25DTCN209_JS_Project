let currentUser = JSON.parse(localStorage.getItem("currentUser"));
if (!currentUser) {
    window.location.href = "./pages/login.html";
}

const menu = document.getElementById("menu");
const logoutPopup = document.getElementById("popup");
const confirmBtn = document.getElementById("confirm-btn");
const cancelBtn = document.getElementById("cancel-btn");

function logOut() {
    if (menu.value === "logout") {
        logoutPopup.style.display = "flex";
    }
}

cancelBtn.addEventListener("click", function () {
    logoutPopup.style.display = "none";
    menu.value = "";
});

confirmBtn.addEventListener("click", function () {
    localStorage.removeItem("currentUser");
    window.location.href = "./pages/login.html";
});

const month = document.getElementById("monthChoose");
const budgetInput = document.getElementById("budgetInput");
const saveBtn = document.getElementById("saveBudget");
const remainMoney = document.getElementById("remain");
const warning = document.getElementById("warning");
const today = new Date();
const defaultMonth = today.toISOString().slice(0, 7);

function getSavedMonth() {
    return localStorage.getItem(`selectedMonth_${currentUser.id}`) || defaultMonth;
}

function saveSelectedMonth(monthValue) {
    localStorage.setItem(`selectedMonth_${currentUser.id}`, monthValue);
}

month.value = getSavedMonth();

function formatMoney(num) {
    if (typeof num !== "number") return "0 VND";
    return num.toLocaleString("vi-VN") + " VND";
}

function getKey(month) {
    return `finance_${currentUser.id}_${month}`;
}

function loadData() {
    const monthChoice = month.value;
    const data = JSON.parse(localStorage.getItem(getKey(monthChoice))) || {};
    const budget = data.budget || 0;
    const spend = data.spend || 0;
    if (budget <= 0) {
        warning.style.display = "block";
        remainMoney.innerText = "0 VND";
        document.getElementById("spent").innerText = formatMoney(spend);
        return;
    }
    warning.style.display = "none";
    const remain = budget - spend;
    remainMoney.innerText = formatMoney(remain);
    document.getElementById("spent").innerText = formatMoney(spend);
}

function saveData() {
    const monthChoice = month.value;
    const budget = Number(budgetInput.value);
    if (!budget || budget <= 0) {
        alert("Vui lòng nhập ngân sách hợp lệ!");
        return;
    }
    const key = getKey(monthChoice);
    const data = JSON.parse(localStorage.getItem(key)) || {};
    const newData = {
        ...data,
        budget: budget,
        spend: data.spend || 0
    };

    localStorage.setItem(key, JSON.stringify(newData));
    loadData();
    budgetInput.value = "";
};

month.onchange = function () {
    saveSelectedMonth(month.value);
    loadData();
};

const editPopup = document.getElementById("editPopup");
const openEditBtn = document.getElementById("openEdit");
const closeEdit = document.getElementById("closeEdit");
const cancelEdit = document.getElementById("cancelEdit");
const saveEdit = document.getElementById("saveEdit");
const editName = document.getElementById("editName");
const editEmail = document.getElementById("editEmail");
const editPhone = document.getElementById("editPhone");
const editGender = document.getElementById("editGender");
const editNameError = document.getElementById("editNameError");
const editEmailError = document.getElementById("editEmailError");
const editPhoneError = document.getElementById("editPhoneError");
const editGenderError = document.getElementById("editGenderError");

openEditBtn.addEventListener("click", () => {
    editPopup.style.display = "flex";
    editName.value = currentUser.name || "";
    editEmail.value = currentUser.email || "";
    editPhone.value = currentUser.phone || "";
    editGender.value = currentUser.gender || "Male";
});

function closeEditModal() {
    editPopup.style.display = "none";
    editNameError.innerText = "";
    editEmailError.innerText = "";
    editPhoneError.innerText = "";
    editGenderError.innerText = "";
    editName.parentElement.classList.remove("error");
    editEmail.parentElement.classList.remove("error");
    editPhone.parentElement.classList.remove("error");
}
closeEdit.onclick = closeEditModal;
cancelEdit.onclick = closeEditModal;
saveEdit.addEventListener("click", () => {
    const name = editName.value.trim();
    const email = editEmail.value.trim();
    const phone = editPhone.value.trim();
    const gender = editGender.value;
    editNameError.innerText = "";
    editEmailError.innerText = "";
    editPhoneError.innerText = "";
    editGenderError.innerText = "";
    editName.parentElement.classList.remove("error");
    editEmail.parentElement.classList.remove("error");
    editPhone.parentElement.classList.remove("error");
    let isValidation = true;
    if (!name) {
        editNameError.innerText = "Please enter your name ...";
        editName.parentElement.classList.add("error");
        isValidation = false;
    }
    if (!email) {
        editEmailError.innerText = "Please enter your email ...";
        editEmail.parentElement.classList.add("error");
        isValidation = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        editEmailError.innerText = "The email is not in the correct format";
        editEmail.parentElement.classList.add("error");
        isValidation = false;
    }
    if (!phone) {
        editPhoneError.innerText = "Please enter your phone ...";
        editPhone.parentElement.classList.add("error");
        isValidation = false;
    }
    if (!isValidation) return;
    currentUser = {
        ...currentUser,
        name,
        email,
        phone,
        gender
    };
    localStorage.setItem("currentUser", JSON.stringify(currentUser));
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const index = users.findIndex(u => u.id === currentUser.id);
    if (index !== -1) {
        users[index] = currentUser;
        localStorage.setItem("users", JSON.stringify(users));
    }
    document.querySelectorAll(".profile-form input")[0].value = name;
    document.querySelectorAll(".profile-form input")[1].value = email;
    document.querySelectorAll(".profile-form input")[2].value = phone;
    document.querySelectorAll(".profile-form input")[3].value = gender;
    closeEditModal();
});

function loadUserInfo() {
    document.getElementById("profileName").value = currentUser.name || "";
    document.getElementById("profileEmail").value = currentUser.email || "";
    document.getElementById("profilePhone").value = currentUser.phone || "";
    document.getElementById("profileGender").value = currentUser.gender || "";
}

const passwordPopup = document.getElementById("passwordPopup");
const openPassword = document.getElementById("openPassword");
const closePassword = document.getElementById("closePassword");
const cancelPassword = document.getElementById("cancelPassword");
const savePassword = document.getElementById("savePassword");
const oldPassword = document.getElementById("oldPassword");
const newPassword = document.getElementById("newPassword");
const confirmPassword = document.getElementById("confirmPassword");
const oldPassError = document.getElementById("oldPassError");
const newPassError = document.getElementById("newPassError");
const confirmPassError = document.getElementById("confirmPassError");

openPassword.onclick = () => {
    passwordPopup.style.display = "flex";
};

function closePasswordModal() {
    passwordPopup.style.display = "none";
    oldPassword.value = "";
    newPassword.value = "";
    confirmPassword.value = "";
    oldPassError.innerText = "";
    newPassError.innerText = "";
    confirmPassError.innerText = "";
    oldPassword.parentElement.classList.remove("error");
    newPassword.parentElement.classList.remove("error");
    confirmPassword.parentElement.classList.remove("error");
}
closePassword.onclick = closePasswordModal;
cancelPassword.onclick = closePasswordModal;
savePassword.onclick = () => {
    const oldPass = oldPassword.value.trim();
    const newPass = newPassword.value.trim();
    const confirmPass = confirmPassword.value.trim();
    oldPassError.innerText = "";
    newPassError.innerText = "";
    confirmPassError.innerText = "";
    oldPassword.parentElement.classList.remove("error");
    newPassword.parentElement.classList.remove("error");
    confirmPassword.parentElement.classList.remove("error");
    let isValidation = true;
    if (!oldPass) {
        oldPassError.innerText = "Please enter your old password ...";
        oldPassword.parentElement.classList.add("error");
        isValidation = false;
    }
    if (!newPass) {
        newPassError.innerText = "Please enter your new password ...";
        newPassword.parentElement.classList.add("error");
        isValidation = false;
    }
    if (!confirmPass) {
        confirmPassError.innerText = "Please enter your confirm new password ...";
        confirmPassword.parentElement.classList.add("error");
        isValidation = false;
    }
    if (!isValidation) return;
    if (oldPass !== currentUser.password) {
        oldPassError.innerText = "The old password is incorrect";
        oldPassword.parentElement.classList.add("error");
        return;
    }
    if (newPass !== confirmPass) {
        confirmPassError.innerText = "The confirm password is incorrect";
        confirmPassword.parentElement.classList.add("error");
        return;
    }
    if (newPass.length < 6) {
        newPassError.innerText = "The password must have at least 6 characters";
        newPassword.parentElement.classList.add("error");
        return;
    }
    currentUser.password = newPass;
    localStorage.setItem("currentUser", JSON.stringify(currentUser));
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const index = users.findIndex(u => u.id === currentUser.id);
    if (index !== -1) {
        users[index].password = newPass;
        localStorage.setItem("users", JSON.stringify(users));
    }
    closePasswordModal();
};

function clearError(group) {
    group.classList.remove("error");
    const errorText = group.querySelector(".error");
    if (errorText) {
        errorText.innerText = "";
    }
}

oldPassword.addEventListener("click", () => {
    clearError(oldPassword.parentElement);
});

newPassword.addEventListener("click", () => {
    clearError(newPassword.parentElement);
});

confirmPassword.addEventListener("click", () => {
    clearError(confirmPassword.parentElement);
});

editName.addEventListener("click", () => {
    clearError(editName.parentElement);
});

editEmail.addEventListener("click", () => {
    clearError(editEmail.parentElement);
});

editPhone.addEventListener("click", () => {
    clearError(editPhone.parentElement);
});

loadData();
loadUserInfo();
