let currentUser = JSON.parse(localStorage.getItem("currentUser"));
if(!currentUser){
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
const budgetShow = document.getElementById("budgetShow");
const spendShow = document.getElementById("spendShow");
const remainShow = document.getElementById("remainShow");
const remainMoney = document.getElementById("remain");
const warning = document.getElementById("warning");
const today = new Date();
const defaultMonth = today.toISOString().slice(0, 7);
month.value = defaultMonth;

function formatMoney(num) {
    if (typeof num !== "number") return "0 VND";
    return num.toLocaleString("vi-VN") + " VND";
}

function getKey(month) {
    return `finance_${currentUser.id}_${month}`;
}

function loadData() {
    const monthChoice = month.value;
    const data = JSON.parse(localStorage.getItem(getKey(monthChoice)));
    if (!data) {
        budgetShow.innerText = "0 VND";
        spendShow.innerText = "0 VND";
        remainShow.innerText = "0 VND";
        remainMoney.innerText = "0 VND";
        warning.style.display = "block";
        return;
    }
    warning.style.display = "none";
    const budget = data.budget || 0;
    const spend = data.spend || 0;
    const remain = budget - spend;
    budgetShow.innerText = formatMoney(budget);
    spendShow.innerText = formatMoney(spend);
    remainShow.innerText = formatMoney(remain);
    remainMoney.innerText = formatMoney(remain);
}

function saveData(){
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
month.onchange = loadData;
loadData();