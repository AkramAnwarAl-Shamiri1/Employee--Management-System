
const form = document.getElementById("employeeForm");
const nameInput = document.querySelector("#name");
const roleInput = document.getElementById("role");
const statusSelect = document.getElementById("status");
const salaryInput = document.getElementById("salary");
const errorMsg = document.getElementById("formError");

const employeeTableBody = document.querySelector("#employeeTable tbody");
const trashTableBody = document.querySelector("#trashTable tbody");
const trashSection = document.getElementById("trashSection");
const toggleTrashBtn = document.getElementById("toggleTrashBtn");
const mainCountSpan = document.getElementById("mainCount");
const trashCountSpan = document.getElementById("trashCount");
const totalSalarySpan = document.getElementById("totalSalary");

const filterName = document.getElementById("searchAll");


const clearFiltersBtn = document.getElementById("clearFilters");


const bonusModal = document.getElementById("bonusModal");
const closeBonusModalBtn = document.getElementById("closeBonusModal");
const bonusInput = document.getElementById("bonusInput");
const saveBonusBtn = document.getElementById("saveBonusBtn");
const bonusError = document.getElementById("bonusError");

let employees = [];
let trash = [];
let editingBonusEmployeeId = null;

function validateForm(name, role, status, salary) {
  const nameRoleRegex = /^[\u0621-\u064Aa-zA-Z\s]{2,}$/; 
  const salaryRegex = /^\d+(\.\d{1,2})?$/; 
  if (!name || !role || !status || !salary) {
    errorMsg.innerText = "جميع الحقول مطلوبة!";
    return false;
  }
  if (!nameRoleRegex.test(name)) {
    errorMsg.innerText = "الاسم يجب أن يحتوي على حروف عربية أو إنجليزية ومسافات فقط، وبحد أدنى حرفين";
    return false;
  }
  if (!nameRoleRegex.test(role)) {
    errorMsg.innerText = "الوظيفة يجب أن تحتوي على حروف عربية أو إنجليزية ومسافات فقط، وبحد أدنى حرفين";
    return false;
  }
  if (!salaryRegex.test(salary) || parseFloat(salary) <= 0) {
    errorMsg.innerText = "الراتب يجب أن يكون رقمًا موجبًا صالحًا";
    return false;
  }
  errorMsg.innerText = "";
  return true;
}


form.addEventListener("submit", function (e) {
  e.preventDefault();

  const name = nameInput.value.trim();
  const role = roleInput.value.trim();
  const status = statusSelect.value;
  const salary = salaryInput.value.trim();

  if (!validateForm(name, role, status, salary)) {
    return;
  }

  const employee = {
    id: Date.now(),
    name,
    role,
    status,
    salary: parseFloat(salary),
    bonusPercent: 0,
    bonusValue: 0,
  };

  employees.push(employee);

  form.reset();

  renderEmployees();
  applyFilters();
});

function getBadgeClass(status) {
  switch (status) {
    case "Active": return "badge-active";
    case "On Leave": return "badge-onleave";
    case "Terminated": return "badge-terminated";
    default: return "";
  }
}


function renderEmployees(filteredEmployees = null) {
  console.time("renderEmployees");
  employeeTableBody.innerHTML = "";

  const list = filteredEmployees || employees;

  list.forEach(emp => {
    const tr = document.createElement("tr");
    tr.setAttribute("data-id", emp.id);


    const highSalaryBadge = emp.salary >= 100000 ? `<span class="badge badge-highsalary" title="راتب عالي">عالي</span>` : "";
    const bonusBadge = emp.bonusPercent > 0 ? `<span class="badge badge-bonus" title="لديه مكافأة">${emp.bonusPercent}%</span>` : "";

    tr.innerHTML = `
      <td>${emp.name} ${highSalaryBadge} ${bonusBadge}</td>
      <td>${emp.role}</td>
      <td><span class="badge ${getBadgeClass(emp.status)}">${emp.status}</span></td>
      <td>${emp.salary.toLocaleString()} ر.س</td>
      <td>${emp.bonusValue.toLocaleString()} ر.س</td>
      <td>
        <button class="action-btn edit-btn">تعديل</button>
        <button class="action-btn bonus-btn">مكافأة</button>
        <button class="action-btn delete-btn">حذف</button>
      </td>
    `;

    tr.querySelector(".edit-btn").addEventListener("click", () => editEmployee(emp.id));
    tr.querySelector(".bonus-btn").addEventListener("click", () => openBonusModal(emp.id));
    tr.querySelector(".delete-btn").addEventListener("click", () => deleteEmployee(emp.id));

    employeeTableBody.appendChild(tr);
  });

  updateCounters(filteredEmployees || employees);
  console.timeEnd("renderEmployees");
}


function renderTrash() {
  trashTableBody.innerHTML = "";

  trash.forEach(emp => {
    const tr = document.createElement("tr");
    tr.setAttribute("data-id", emp.id);

    const highSalaryBadge = emp.salary >= 100000 ? `<span class="badge badge-highsalary" title="راتب عالي">عالي</span>` : "";
    const bonusBadge = emp.bonusPercent > 0 ? `<span class="badge badge-bonus" title="لديه مكافأة">${emp.bonusPercent}%</span>` : "";

    tr.innerHTML = `
      <td>${emp.name} ${highSalaryBadge} ${bonusBadge}</td>
      <td>${emp.role}</td>
      <td><span class="badge ${getBadgeClass(emp.status)}">${emp.status}</span></td>
      <td>${emp.salary.toLocaleString()} ر.س</td>
      <td>${emp.bonusValue.toLocaleString()} ر.س</td>
      <td>
        <button class="action-btn restore-btn">استرجاع</button>
        <button class="action-btn delete-permanent-btn">حذف نهائي</button>
      </td>
    `;

    tr.querySelector(".restore-btn").addEventListener("click", () => restoreEmployee(emp.id));
    tr.querySelector(".delete-permanent-btn").addEventListener("click", () => deletePermanently(emp.id));

    trashTableBody.appendChild(tr);
  });

  updateCounters();
}


function updateCounters(filteredList = null) {
  mainCountSpan.innerText = (filteredList || employees).length;
  trashCountSpan.innerText = trash.length;
 
  const total = (filteredList || employees).reduce((acc, emp) => acc + emp.salary + emp.bonusValue, 0);
  totalSalarySpan.innerText = total.toLocaleString();
}


function openBonusModal(employeeId) {
  editingBonusEmployeeId = employeeId;
  bonusInput.value = "";
  bonusError.innerText = "";
  bonusModal.style.display = "block";
}


closeBonusModalBtn.addEventListener("click", () => {
  bonusModal.style.display = "none";
});


saveBonusBtn.addEventListener("click", () => {
  const bonusPercent = parseFloat(bonusInput.value);
  if (isNaN(bonusPercent) || bonusPercent < 0 || bonusPercent > 100) {
    bonusError.innerText = "الرجاء إدخال نسبة صحيحة بين 0 و 100";
    return;
  }

  const emp = employees.find(e => e.id === editingBonusEmployeeId);
  if (!emp) return;

  emp.bonusPercent = bonusPercent;
  emp.bonusValue = (emp.salary * bonusPercent) / 100;

  bonusModal.style.display = "none";
  renderEmployees();
  applyFilters();
});


function editEmployee(id) {
  const emp = employees.find(e => e.id === id);
  if (!emp) return;

  const newName = prompt("تعديل الاسم:", emp.name);
  if (newName === null) return;

  const newRole = prompt("تعديل الوظيفة:", emp.role);
  if (newRole === null) return;

  const newStatus = prompt("تعديل الحالة (Active, On Leave, Terminated):", emp.status);
  if (newStatus === null) return;

  const newSalary = prompt("تعديل الراتب (رقم فقط):", emp.salary);
  if (newSalary === null) return;


  if (!validateForm(newName.trim(), newRole.trim(), newStatus.trim(), newSalary.trim())) {
    alert("بيانات غير صالحة. لم يتم التعديل.");
    return;
  }

  emp.name = newName.trim();
  emp.role = newRole.trim();
  emp.status = newStatus.trim();
  emp.salary = parseFloat(newSalary.trim());
  emp.bonusValue = (emp.salary * emp.bonusPercent) / 100;

  renderEmployees();
  applyFilters();
}


function deleteEmployee(id) {
  const emp = employees.find(e => e.id === id);
  if (!emp) return;

  if (confirm(`هل أنت متأكد من حذف الموظف: ${emp.name}؟`)) {
    trash.push(emp);
    employees = employees.filter(e => e.id !== id);
    renderEmployees();
    renderTrash();
  }
}


function restoreEmployee(id) {
  const emp = trash.find(e => e.id === id);
  if (!emp) return;

  employees.push(emp);
  trash = trash.filter(e => e.id !== id);

  renderEmployees();
  renderTrash();
}


function deletePermanently(id) {
  if (confirm("هل تريد الحذف النهائي؟")) {
    trash = trash.filter(e => e.id !== id);
    renderTrash();
  }
}

const searchAllInput = document.getElementById("searchAll");

searchAllInput.addEventListener("input", () => {
  const value = searchAllInput.value.toLowerCase();

  const filtered = employees.filter(emp =>
    emp.name.toLowerCase().includes(value) ||
    emp.role.toLowerCase().includes(value) ||
    emp.status.toLowerCase().includes(value) ||
    emp.salary.toString().includes(value) ||
    emp.bonusValue.toString().includes(value) ||
    emp.bonusPercent.toString().includes(value)
  );

  renderEmployees(filtered);
});



clearFiltersBtn.addEventListener("click", () => {
  searchAllInput.value = "";
  renderEmployees();
});



toggleTrashBtn.addEventListener("click", () => {
  if (trashSection.style.display === "none") {
    trashSection.style.display = "block";
    toggleTrashBtn.innerText = "إخفاء سلة المحذوفات";
  } else {
    trashSection.style.display = "none";
    toggleTrashBtn.innerText = "عرض سلة المحذوفات";
  }
});



renderEmployees();
renderTrash();


