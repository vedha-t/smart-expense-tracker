
const form = document.getElementById("expense-form");
const nameInput = document.getElementById("name");
const amountInput = document.getElementById("amount");
const categoryInput = document.getElementById("category");
const totalDisplay = document.getElementById("total");
const expenseList = document.getElementById("expense-list");

const budgetInput = document.getElementById("budget");
const saveBudgetButton = document.getElementById("save-budget");
const remainingDisplay = document.getElementById("remaining");

let expenses = JSON.parse(localStorage.getItem("expenses")) || [];
let budget = Number(localStorage.getItem("budget")) || 0;
let expenseChart = null;

if (budgetInput) {
    budgetInput.value = budget || "";
}

function updateChart() {
    const canvas = document.getElementById("expenseChart");
    if (!canvas || typeof Chart === "undefined") return;

    const categories = {};

    expenses.forEach(function(expense) {
        categories[expense.category] =
            (categories[expense.category] || 0) + expense.amount;
    });

    if (expenseChart) {
        expenseChart.destroy();
    }

    expenseChart = new Chart(canvas, {
        type: "pie",
        data: {
            labels: Object.keys(categories),
            datasets: [{
                data: Object.values(categories)
            }]
        },
        options: {
            responsive: true
        }
    });
}

function displayExpenses() {
    expenseList.innerHTML = "";
    let total = 0;

    expenses.forEach(function(expense) {
        total += expense.amount;

        const item = document.createElement("li");
        const text = document.createElement("span");

        text.textContent =
            `${expense.name} - ₹${expense.amount.toFixed(2)} (${expense.category}) `;

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.textContent = "Delete";

        deleteButton.addEventListener("click", function() {
            expenses = expenses.filter(function(e) {
                return e.id !== expense.id;
            });

            saveExpenses();
            displayExpenses();
        });

        item.append(text, deleteButton);
        expenseList.appendChild(item);
    });

    totalDisplay.textContent = "₹" + total.toFixed(2);

    if (remainingDisplay) {
        remainingDisplay.textContent =
            "₹" + (budget - total).toFixed(2);

        remainingDisplay.style.color =
            budget - total < 0 ? "red" : "green";
    }

    updateChart();
}

function saveExpenses() {
    localStorage.setItem("expenses", JSON.stringify(expenses));
}

form.addEventListener("submit", function(event) {
    event.preventDefault();

    const name = nameInput.value.trim();
    const amount = Number(amountInput.value);
    const category = categoryInput.value;

    if (!name || !Number.isFinite(amount) || amount <= 0) {
        alert("Please enter valid expense details.");
        return;
    }

    expenses.push({
        id: Date.now() + Math.random(),
        name: name,
        amount: amount,
        category: category
    });

    saveExpenses();
    displayExpenses();
    form.reset();
});

if (saveBudgetButton && budgetInput) {
    saveBudgetButton.addEventListener("click", function() {
        const value = Number(budgetInput.value);

        if (budgetInput.value === "" ||
            !Number.isFinite(value) || value < 0) {
            alert("Please enter a valid budget.");
            return;
        }

        budget = value;
        localStorage.setItem("budget", budget);
        displayExpenses();
    });
}

displayExpenses();
