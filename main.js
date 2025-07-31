
const form = document.getElementById("employeeForm");
const nameInput = document.querySelector("#name");
const roleInput = document.getElementById("role");
const statusSelect = document.querySelector("#status");
const errorMsg = document.getElementById("formError");

const employeeTableBody = document.querySelector("#employeeTable tbody");
const trashTableBody = document.querySelector("#trashTable tbody");
const trashSection = document.getElementById("trashSection");
const toggleTrashBtn = document.getElementById("toggleTrashBtn");
const mainCountSpan = document.getElementById("mainCount");
const trashCountSpan = document.getElementById("trashCount");


let employees = [];
let trash = [];

form.addEventListener("submit", function (e) {
  e.preventDefault();

  console.time("Add Employee");

  const name = nameInput.value.trim();
  const role = roleInput.value.trim();
  const status = statusSelect.value;

  const arabicOnly = /^[\u0600-\u06FF\s]{2,}$/;
  const englishOnly = /^[A-Za-z\s]{2,}$/;

  const nameValid = arabicOnly.test(name) || englishOnly.test(name);
  const roleValid = arabicOnly.test(role) || englishOnly.test(role);

  if (!name || !role || !status) {
    errorMsg.innerText = "يرجى تعبئة جميع الحقول!";
    console.timeEnd("Add Employee");
    return;
  }

  if (!nameValid) {
    errorMsg.innerText = "الاسم يجب أن يكون بالعربية فقط أو بالإنجليزية فقط (بدون رموز أو أرقام)";
    console.timeEnd("Add Employee");
    return;
  }

  if (!roleValid) {
    errorMsg.innerText = "الوظيفة يجب أن تكون بالعربية فقط أو بالإنجليزية فقط (بدون رموز أو أرقام)";
    console.timeEnd("Add Employee");
    return;
  }

  errorMsg.innerText = "";

  const employee = {
    id: Date.now(),
    name,
    role,
    status
  };

  employees.push(employee);
  form.reset();
  renderEmployees();

  console.timeEnd("Add Employee");
});


function getBadgeClass(status) {
  switch (status) {
    case "Active": return "badge-active";
    case "On Leave": return "badge-onleave";
    case "Terminated": return "badge-terminated";
    default: return "";
  }
}


function renderEmployees() {
  employeeTableBody.innerHTML = "";

  employees.forEach(emp => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${emp.name}</td>
      <td>${emp.role}</td>
      <td><span class="badge ${getBadgeClass(emp.status)}">${emp.status}</span></td>
      <td>
        <button class="action-btn edit-btn">Edit</button>
        <button class="action-btn delete-btn">Delete</button>
      </td>
    `;

    tr.setAttribute("data-id", emp.id);

    tr.querySelector(".edit-btn").addEventListener("click", () => editEmployee(emp.id));
    tr.querySelector(".delete-btn").addEventListener("click", () => deleteEmployee(emp.id));

    employeeTableBody.appendChild(tr);
  });

  updateCounters();
}


function editEmployee(id) {
  const emp = employees.find(e => e.id === id);
  if (!emp) return;

  const newName = prompt("Edit Employee Name:", emp.name);
  if (newName === null) return;

  const newRole = prompt("Edit Employee Role:", emp.role);
  if (newRole === null) return;

  const arabicOnly = /^[\u0600-\u06FF\s]{2,}$/;
  const englishOnly = /^[A-Za-z\s]{2,}$/;

  const nameValid = newName && (arabicOnly.test(newName.trim()) || englishOnly.test(newName.trim()));
  const roleValid = newRole && (arabicOnly.test(newRole.trim()) || englishOnly.test(newRole.trim()));

  if (!newName || !newRole) {
    alert("لا يمكن ترك الاسم أو الوظيفة فارغة");
    return;
  }

  if (!nameValid) {
    alert("الاسم يجب أن يكون بالعربية فقط أو بالإنجليزية فقط (بدون رموز أو أرقام)");
    return;
  }

  if (!roleValid) {
    alert("الوظيفة يجب أن تكون بالعربية فقط أو بالإنجليزية فقط (بدون رموز أو أرقام)");
    return;
  }

  emp.name = newName.trim();
  emp.role = newRole.trim();

  renderEmployees();
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


function renderTrash() {
  trashTableBody.innerHTML = "";

  trash.forEach(emp => {
    const tr = document.createElement("tr");
    tr.setAttribute("data-id", emp.id);

    tr.innerHTML = `
      <td>${emp.name}</td>
      <td>${emp.role}</td>
      <td><span class="badge ${getBadgeClass(emp.status)}">${emp.status}</span></td>
      <td>
        <button class="action-btn restore-btn">Restore</button>
        <button class="action-btn delete-permanent-btn">Delete Permanently</button>
      </td>
    `;

    tr.querySelector(".restore-btn").addEventListener("click", () => restoreEmployee(emp.id));
    tr.querySelector(".delete-permanent-btn").addEventListener("click", () => deletePermanently(emp.id));

    trashTableBody.appendChild(tr);
  });

  updateCounters();
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


function updateCounters() {
  mainCountSpan.innerText = employees.length;
  trashCountSpan.innerText = trash.length;
}


toggleTrashBtn.addEventListener("click", () => {
  if (trashSection.style.display === "none" || trashSection.style.display === "") {
    trashSection.style.display = "block";
    toggleTrashBtn.innerText = "إخفاء سلة المحذوفات";
    toggleTrashBtn.setAttribute("aria-expanded", "true");
    trashSection.setAttribute("aria-hidden", "false");
  } else {
    trashSection.style.display = "none";
    toggleTrashBtn.innerText = "عرض سلة المحذوفات";
    toggleTrashBtn.setAttribute("aria-expanded", "false");
    trashSection.setAttribute("aria-hidden", "true");
  }
});


renderEmployees();
renderTrash();
