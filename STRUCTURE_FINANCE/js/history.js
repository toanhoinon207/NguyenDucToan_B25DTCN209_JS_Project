const users = JSON.parse(localStorage.getItem("users")) || [];
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
    localStorage.removeItem("users");
    window.location.href = "./login.html";
});