const currentUser = JSON.parse(localStorage.getItem("currentUser"));
if (!currentUser) {
    window.location.href = "../pages/login.html";
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
    window.location.href = "./login.html";
});

function getCategoriesKey() {
    return `categories_${currentUser.id}`;
}

function getTransactionsKey(month) {
    return `transactions_${currentUser.id}_${month}`;
}

function updateCategoryInTransactions(oldCategoryName, newCategoryName, currentMonth) {
    const transactionsKey = getTransactionsKey(currentMonth);
    const transactions = JSON.parse(localStorage.getItem(transactionsKey)) || [];

    let updated = false;
    transactions.forEach(transaction => {
        if (transaction.category === oldCategoryName) {
            transaction.category = newCategoryName;
            updated = true;
        }
    });

    if (updated) {
        localStorage.setItem(transactionsKey, JSON.stringify(transactions));
    }
}

let userCategories = JSON.parse(localStorage.getItem(getCategoriesKey())) || {};
const month = document.getElementById("monthChoose");
const remainMoney = document.getElementById("remain");
const spentMoney = document.getElementById("spent");
const warning = document.getElementById("warning");
const today = new Date();

function getSavedMonth() {
    return localStorage.getItem(`selectedMonth_${currentUser.id}`) || today.toISOString().slice(0, 7);
}

function saveSelectedMonth(monthValue) {
    localStorage.setItem(`selectedMonth_${currentUser.id}`, monthValue);
}

month.value = getSavedMonth();

function formatMoney(num) {
    if (!Number.isFinite(num)) return "0 VND";
    return num.toLocaleString("vi-VN") + " VND";
}

function getKey(month) {
    return `finance_${currentUser.id}_${month}`;
}

function loadData() {
    const monthChoice = month.value;
    const data = JSON.parse(localStorage.getItem(getKey(monthChoice)));
    const budget = Number(data?.budget) || 0;
    const spend = Number(data?.spend) || 0;

    if (!data || budget <= 0) {
        warning.style.display = "block";
    } else {
        warning.style.display = "none";
    }

    remainMoney.innerText = formatMoney(budget - spend);
    spentMoney.innerText = formatMoney(spend);
    renderCategories();
}

month.onchange = function () {
    saveSelectedMonth(month.value);
    loadData();
};

loadData();

const limitInput = document.getElementById("categoryLimit");
const typeSelect = document.getElementById("categoryType");

function addCategory() {
    const selectedType = typeSelect.value;
    const limit = Number(limitInput.value);

    if (!selectedType) {
        alert("Vui lòng chọn loại danh mục!");
        return;
    }

    if (!limit) {
        alert("Vui lòng nhập giới hạn!");
        return;
    }

    const currentMonth = month.value;
    if (!userCategories[currentMonth]) {
        userCategories[currentMonth] = [];
    }
    const monthCategories = userCategories[currentMonth];
    const existingCategory = monthCategories.find(cat => cat.name === selectedType);
    if (existingCategory) {
        existingCategory.limit += limit;
    } else {
        const newCategory = {
            id: Date.now(),
            userId: currentUser.id,
            month: currentMonth,
            name: selectedType,
            limit: limit
        };
        monthCategories.push(newCategory);
    }
    userCategories[currentMonth] = monthCategories;
    localStorage.setItem(getCategoriesKey(), JSON.stringify(userCategories));

    renderCategories();
    typeSelect.value = "";
    limitInput.value = "";
}

function renderCategories() {
    const grid = document.querySelector(".category-grid");
    grid.innerHTML = "";
    const currentMonth = month.value;
    const monthCategories = userCategories[currentMonth] || [];
    if (monthCategories.length === 0) {
        grid.innerHTML = "<p style='grid-column: 1/-1; text-align: center; padding: 20px; color: #999;'>Bạn chưa có danh mục nào cho tháng này!</p>";
        return;
    }
    monthCategories.forEach((cat, index) => {
        grid.innerHTML += `
            <div class="category-item">
                <div class="cat-left">
                    <span class="icon"><img src="../assets/images/Vector (15).png" alt=""></span>
                    <div>
                        <p class="cat-name">${cat.name}</p>
                        <p class="cat-money">${formatMoney(cat.limit)}</p>
                    </div>
                </div>
                <div class="cat-actions">
                    <span onclick="deleteCategory(${index})">&times;</span>
                    <span class="edit" onclick="openEditModal(${index})">✎</span>
                </div>
            </div>
        `;
    });
}

function deleteCategory(index) {
    const currentMonth = month.value;
    const monthCategories = userCategories[currentMonth] || [];
    const categoryToDelete = monthCategories[index];
    if (confirm(`Bạn có chắc chắn muốn xóa category "${categoryToDelete.name}"?`)) {
        const transactionsKey = getTransactionsKey(currentMonth);
        const transactions = JSON.parse(localStorage.getItem(transactionsKey)) || [];
        const categoryTransactions = transactions.filter(t => t.category === categoryToDelete.name);
        let deleteHistory = false;
        if (categoryTransactions.length > 0) {
            deleteHistory = confirm(`Category "${categoryToDelete.name}" có ${categoryTransactions.length} giao dịch. Bạn có muốn xóa tất cả lịch sử giao dịch của category này không?`);
        }
        if (deleteHistory) {
            const filteredTransactions = transactions.filter(t => t.category !== categoryToDelete.name);
            localStorage.setItem(transactionsKey, JSON.stringify(filteredTransactions));
        } else {
            transactions.forEach(transaction => {
                if (transaction.category === categoryToDelete.name) {
                    transaction.category = "-";
                }
            });
            localStorage.setItem(transactionsKey, JSON.stringify(transactions));
        }
        monthCategories.splice(index, 1);
        if (monthCategories.length === 0) {
            delete userCategories[currentMonth];
        } else {
            userCategories[currentMonth] = monthCategories;
        }
        localStorage.setItem(getCategoriesKey(), JSON.stringify(userCategories));
        renderCategories();
    }
}

function openEditModal(index) {
    const currentMonth = month.value;
    const monthCategories = userCategories[currentMonth] || [];
    if (!monthCategories[index]) {
        alert("Không tìm thấy category để chỉnh sửa!");
        return;
    }
    const categoryToEdit = monthCategories[index];
    window.editingCategoryIndex = index;
    document.getElementById("editCategoryName").value = categoryToEdit.name;
    document.getElementById("editCategoryLimit").value = categoryToEdit.limit;
    document.getElementById("editPopup").style.display = "flex";
}

function closeEditModal() {
    document.getElementById("editPopup").style.display = "none";
    document.getElementById("editCategoryName").value = "";
    document.getElementById("editCategoryLimit").value = "";
    delete window.editingCategoryIndex;
}

function saveEditCategory() {
    const newName = document.getElementById("editCategoryName").value;
    const newLimit = Number(document.getElementById("editCategoryLimit").value);
    if (!newName || !newLimit) {
        alert("Vui lòng nhập đầy đủ thông tin!");
        return;
    }
    if (newLimit <= 0) {
        alert("Giới hạn phải lớn hơn 0!");
        return;
    }
    const currentMonth = month.value;
    const monthCategories = userCategories[currentMonth] || [];
    const editingIndex = window.editingCategoryIndex;
    if (editingIndex === undefined || !monthCategories[editingIndex]) {
        alert("Không tìm thấy category để cập nhật!");
        return;
    }
    const oldCategoryName = monthCategories[editingIndex].name;
    if (newName !== oldCategoryName) {
        const isDuplicateName = monthCategories.some((cat, index) => cat.name === newName && index !== editingIndex);
        if (isDuplicateName) {
            alert("Tên category này đã tồn tại trong tháng này!");
            return;
        }
        // Update category name in all transactions for this month
        updateCategoryInTransactions(oldCategoryName, newName, currentMonth);
    }
    monthCategories[editingIndex] = {
        ...monthCategories[editingIndex],
        name: newName,
        limit: newLimit
    };
    userCategories[currentMonth] = monthCategories;
    localStorage.setItem(getCategoriesKey(), JSON.stringify(userCategories));
    closeEditModal();
    renderCategories();
}

document.getElementById("cancelEditBtn").addEventListener("click", closeEditModal);
document.getElementById("saveEditBtn").addEventListener("click", saveEditCategory);
document.getElementById("editPopup").addEventListener("click", function (e) {
    if (e.target === this) {
        closeEditModal();
    }
});

renderCategories();
