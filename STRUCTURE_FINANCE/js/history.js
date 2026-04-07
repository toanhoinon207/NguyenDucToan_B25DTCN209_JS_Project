const currentUser = JSON.parse(localStorage.getItem("currentUser"));
if (!currentUser) {
    window.location.href = "./login.html";
}

const menu = document.getElementById("menu");
const logoutPopup = document.getElementById("popup");
const confirmBtn = document.getElementById("confirm-btn");
const cancelBtn = document.getElementById("cancel-btn");
const month = document.getElementById("monthChoose");
const remainMoney = document.getElementById("remain");
const spentMoney = document.getElementById("spent");
const warning = document.getElementById("warning");
const transactionAmount = document.getElementById("transactionAmount");
const transactionCategory = document.getElementById("transactionCategory");
const transactionNote = document.getElementById("transactionNote");
const searchInput = document.getElementById("searchInput");
const transactionBody = document.getElementById("transactionBody");
const noDataMessage = document.getElementById("noDataMessage");
const pagination = document.querySelector(".pagination");
let transactions = [];
let filteredTransactions = [];
let currentPage = 1;
const itemsPerPage = 5;
let sortOrder = 'desc';
const today = new Date();

function getSavedMonth() {
    return localStorage.getItem(`selectedMonth_${currentUser.id}`) || today.toISOString().slice(0, 7);
}

function saveSelectedMonth(monthValue) {
    localStorage.setItem(`selectedMonth_${currentUser.id}`, monthValue);
}

month.value = getSavedMonth();
menu.addEventListener("change", logOut);
cancelBtn.addEventListener("click", () => {
    logoutPopup.style.display = "none";
    menu.value = "";
});
confirmBtn.addEventListener("click", () => {
    localStorage.removeItem("currentUser");
    window.location.href = "./login.html";
});

month.addEventListener("change", function () {
    saveSelectedMonth(month.value);
    loadData();
});

function formatMoney(num) {
    if (!Number.isFinite(num)) return "0 VND";
    return num.toLocaleString("vi-VN") + " VND";
}

function getKey(month) {
    return `finance_${currentUser.id}_${month}`;
}

function getTransactionsKey(month) {
    return `transactions_${currentUser.id}_${month}`;
}

function getCategoriesKey() {
    return `categories_${currentUser.id}`;
}

function syncSpendAmount() {
    const currentMonth = month.value;
    const transactionList = JSON.parse(localStorage.getItem(getTransactionsKey(currentMonth))) || [];
    const totalSpend = transactionList.reduce((sum, transaction) => {
        return sum + (Number(transaction.amount) || 0);
    }, 0);
    const financeKey = getKey(currentMonth);
    const financeData = JSON.parse(localStorage.getItem(financeKey)) || { budget: 0, spend: 0 };

    financeData.spend = totalSpend;
    localStorage.setItem(financeKey, JSON.stringify(financeData));
    return financeData;
}

function loadCategories() {
    const categoriesKey = getCategoriesKey();
    const userCategories = JSON.parse(localStorage.getItem(categoriesKey)) || {};
    const currentMonth = month.value;
    const monthCategories = userCategories[currentMonth] || [];
    transactionCategory.innerHTML = '<option value="">Danh mục chi tiêu</option>';
    if (monthCategories.length > 0) {
        monthCategories.forEach(category => {
            const option = document.createElement("option");
            option.value = category.name;
            option.textContent = category.name;
            transactionCategory.appendChild(option);
        });
    } else {
        const option = document.createElement("option");
        option.textContent = "Chưa thêm danh mục";
        transactionCategory.appendChild(option);
    };
}


function getCategoryLimit(categoryName) {
    const categoriesKey = getCategoriesKey();
    const userCategories = JSON.parse(localStorage.getItem(categoriesKey)) || {};
    const currentMonth = month.value;
    const monthCategories = userCategories[currentMonth] || [];
    const target = monthCategories.find(cat => cat.name === categoryName);
    return target ? Number(target.limit) : null;
}

function getCategorySpend(categoryName) {
    const currentMonth = month.value;
    const transactionList = JSON.parse(localStorage.getItem(getTransactionsKey(currentMonth))) || [];
    return transactionList.reduce((sum, transaction) => {
        if (transaction.category === categoryName) {
            return sum + (Number(transaction.amount) || 0);
        }
        return sum;
    }, 0);
}

function loadData() {
    const data = syncSpendAmount();
    if ((data.budget || 0) <= 0) {
        warning.style.display = "block";
        remainMoney.innerText = "0 VND";
        spentMoney.innerText = formatMoney(data.spend || 0);
    } else {
        warning.style.display = "none";
        const budget = data.budget || 0;
        const spend = data.spend || 0;
        const remain = budget - spend;
        remainMoney.innerText = formatMoney(remain);
        spentMoney.innerText = formatMoney(spend);
    }

    loadCategories();
    loadTransactions();
    checkCategoryWarning();
}

function loadTransactions() {
    const currentMonth = month.value;
    const transactionsKey = getTransactionsKey(currentMonth);
    transactions = JSON.parse(localStorage.getItem(transactionsKey)) || [];
    transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
    filteredTransactions = [...transactions];
    currentPage = 1;
    document.getElementById("transactionCount").innerText = transactions.length;
    renderTransactions();
}

function addTransaction() {
    const amount = Number(transactionAmount.value);
    const category = transactionCategory.value;
    const note = transactionNote.value.trim();
    if (!amount || amount <= 0) {
        alert("Vui lòng nhập số tiền hợp lệ!");
        return;
    }
    if (!category) {
        alert("Vui lòng chọn danh mục!");
        return;
    }
    const currentMonth = month.value;
    const financeData = JSON.parse(localStorage.getItem(getKey(currentMonth))) || { budget: 0, spend: 0 };
    const remainingBudget = financeData.budget - financeData.spend;
    if (amount > remainingBudget) {
        alert(`Số tiền chi (${formatMoney(amount)}) vượt quá ngân sách còn lại (${formatMoney(remainingBudget)})!`);
        return;
    }
    const transactionsKey = getTransactionsKey(currentMonth);
    const newTransaction = {
        id: Date.now(),
        amount: amount,
        category: category,
        note: note || "",
        date: new Date().toISOString(),
        month: currentMonth
    };
    transactions = JSON.parse(localStorage.getItem(transactionsKey)) || [];
    transactions.unshift(newTransaction);
    const categoryLimit = getCategoryLimit(category);
    const categorySpend = getCategorySpend(category);
    const totalAdd = categorySpend + amount;
    if (categoryLimit !== null && (categorySpend + amount) > categoryLimit) {
        showToast(
            `Danh mục "${newTransaction.category}" đã vượt giới hạn: ${formatMoney(totalAdd)}/${formatMoney(categoryLimit)}`,
            "warning"
        );
        return;
    }
    localStorage.setItem(transactionsKey, JSON.stringify(transactions));
    syncSpendAmount();
    transactionAmount.value = "";
    transactionCategory.value = "";
    transactionNote.value = "";
    loadData();
}

function showToast(message, type = "error") {
    const toast = document.getElementById("toast");
    toast.innerText = message;
    if (type === "warning") {
        toast.style.background = "#f59e0b";
    }
    toast.classList.add("show");
    setTimeout(() => {
        toast.classList.remove("show");
    }, 3000);
}

function deleteTransaction(id) {
    if (!confirm("Bạn có chắc chắn muốn xóa giao dịch này?")) {
        return;
    }
    const currentMonth = month.value;
    const transactionsKey = getTransactionsKey(currentMonth);
    const transactionIndex = transactions.findIndex(t => t.id === id);
    if (transactionIndex === -1) return;
    transactions.splice(transactionIndex, 1);
    localStorage.setItem(transactionsKey, JSON.stringify(transactions));
    syncSpendAmount();
    loadData();
}

function sortByAmount() {
    sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    filteredTransactions.sort((a, b) => {
        return sortOrder === 'asc' ? a.amount - b.amount : b.amount - a.amount;
    });
    currentPage = 1;
    renderTransactions();
}

function searchTransactions() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    if (!searchTerm) {
        filteredTransactions = [...transactions];
    } else {
        filteredTransactions = transactions.filter(transaction =>
            transaction.category.toLowerCase().includes(searchTerm) ||
            transaction.note.toLowerCase().includes(searchTerm)
        );
    }
    currentPage = 1;
    renderTransactions();
}

function renderTransactions() {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageTransactions = filteredTransactions.slice(startIndex, endIndex);
    transactionBody.innerHTML = "";
    if (pageTransactions.length === 0) {
        noDataMessage.style.display = "block";
        pagination.style.display = "none";
        return;
    }
    noDataMessage.style.display = "none";
    pagination.style.display = "block";
    pageTransactions.forEach((transaction, index) => {
        const row = document.createElement("tr");
        row.className = "transaction-row";
        const transactionDate = new Date(transaction.date);
        const formattedDate = transactionDate.toLocaleDateString('vi-VN');
        row.innerHTML = `
            <td>${startIndex + index + 1}</td>
            <td>${transaction.category}</td>
            <td>${formatMoney(transaction.amount)}</td>
            <td>${transaction.note || "-"}</td>
            <td>${formattedDate}</td>
            <td>
                <button class="delete-btn" onclick="deleteTransaction(${transaction.id})">
                    <img src="../assets/images/Trash.png" alt="Xóa">
                </button>
            </td>
        `;
        transactionBody.appendChild(row);
    });
    renderPagination();
}

function renderPagination() {
    const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
    if (!pagination) return;
    if (totalPages <= 1) {
        pagination.style.display = "none";
        return;
    }
    pagination.style.display = "flex";
    pagination.innerHTML = "";
    const prevBtn = document.createElement("button");
    prevBtn.textContent = "←";
    prevBtn.disabled = currentPage === 1;
    prevBtn.onclick = () => changePage(-1);
    pagination.appendChild(prevBtn);
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);
    for (let i = startPage; i <= endPage; i++) {
        const pageBtn = document.createElement("button");
        pageBtn.textContent = i;
        pageBtn.className = i === currentPage ? "active" : "";
        pageBtn.onclick = () => goToPage(i);
        pagination.appendChild(pageBtn);
    }

    const nextBtn = document.createElement("button");
    nextBtn.textContent = "→";
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.onclick = () => changePage(1);
    pagination.appendChild(nextBtn);
}

function changePage(direction) {
    const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
    const newPage = currentPage + direction;
    if (newPage >= 1 && newPage <= totalPages) {
        currentPage = newPage;
        renderTransactions();
    }
}

function goToPage(page) {
    currentPage = page;
    renderTransactions();
}

function logOut() {
    if (menu.value === "logout") {
        logoutPopup.style.display = "flex";
    }
}
loadData();
