const currentUser = JSON.parse(localStorage.getItem("currentUser"));
if (!currentUser) {
    window.location.href = "../pages/login.html";
}

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
    localStorage.removeItem("currentUser");
    window.location.href = "./login.html";
});

function getCategoriesKey() {
    return `categories_${currentUser.id}`;
}

let userCategories = JSON.parse(localStorage.getItem(getCategoriesKey())) || {};
const month = document.getElementById("monthChoose");
const remainMoney = document.getElementById("remain");
const warning = document.getElementById("warning");
const today = new Date();
month.value = today.toISOString().slice(0, 7);

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
        warning.style.display = "block";
        remainMoney.innerText = "0 VND";
        return;
    }
    warning.style.display = "none";
    const budget = data.budget || 0;
    const spend = data.spend || 0;
    const remain = budget - spend;
    remainMoney.innerText = formatMoney(remain);
    renderCategories();
}

month.onchange = loadData;
loadData();

const nameInput = document.getElementById("categoryName");
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
    const isDuplicateName = monthCategories.some(cat => cat.name === selectedType);
    if (isDuplicateName) {
        alert("Tên category này đã tồn tại trong tháng này!");
        return;
    }

    const newCategory = {
        id: Date.now(),
        userId: currentUser.id,
        month: currentMonth,
        name: selectedType,
        limit: limit
    };
    monthCategories.push(newCategory);
    userCategories[currentMonth] = monthCategories;
    localStorage.setItem(getCategoriesKey(), JSON.stringify(userCategories));

    renderCategories();
    typeSelect.value = "";
    limitInput.value = "";
    alert("Category đã được tạo thành công!");
}

function renderCategories() {
    const grid = document.querySelector(".category-grid");
    grid.innerHTML = "";
    const currentMonth = month.value;
    const monthCategories = userCategories[currentMonth] || [];
    if (monthCategories.length === 0) {
        grid.innerHTML = "<p style='grid-column: 1/-1; text-align: center; padding: 20px; color: #999;'>Bạn chưa có category nào cho tháng này. Hãy tạo một category!</p>";
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

    if (confirm("Bạn có chắc chắn muốn xóa category này? Hành động này không thể hoàn tác.")) {
        monthCategories.splice(index, 1);
        if (monthCategories.length === 0) {
            delete userCategories[currentMonth];
        } else {
            userCategories[currentMonth] = monthCategories;
        }
        localStorage.setItem(getCategoriesKey(), JSON.stringify(userCategories));
        renderCategories();
        alert("Category đã được xóa!");
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
    if (newName !== monthCategories[editingIndex].name) {
        const isDuplicateName = monthCategories.some((cat, index) => cat.name === newName && index !== editingIndex);
        if (isDuplicateName) {
            alert("Tên category này đã tồn tại trong tháng này!");
            return;
        }
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
    alert("Category đã được cập nhật thành công!");
}

document.getElementById("cancelEditBtn").addEventListener("click", closeEditModal);
document.getElementById("saveEditBtn").addEventListener("click", saveEditCategory);
document.getElementById("editPopup").addEventListener("click", function (e) {
    if (e.target === this) {
        closeEditModal();
    }
});

renderCategories();