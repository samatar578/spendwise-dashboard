// =========================================================
// SpendWise — Week 6 Interactive Dashboard
// Conditionals, arrays, loops, DOM, events
// =========================================================

// ---------- 1. APPLICATION DATA ----------
const currencySymbol = "KES";
let monthlyBudget = 50000;

// Array of expense records — each item is an object
let expenses = [
    { name: "Lunch at cafe", amount: 850, category: "Food" },
    { name: "Matatu fare", amount: 200, category: "Transport" },
    { name: "Monthly rent", amount: 12000, category: "Rent" }
];

// ---------- 2. REUSABLE FUNCTIONS ----------

/**
 * Calculate the total of all expenses using a loop.
 * @returns {number} Sum of all expense amounts
 */
function calculateTotalExpenses() {
    let total = 0;
    for (let i = 0; i < expenses.length; i++) {
        total = total + expenses[i].amount;
    }
    return total;
}

/**
 * Calculate the remaining balance.
 * @returns {number} budget minus total expenses
 */
function calculateBalance() {
    return monthlyBudget - calculateTotalExpenses();
}

/**
 * Format a number as currency.
 * @param {number} amount
 * @returns {string}
 */
function formatCurrency(amount) {
    return `${currencySymbol} ${amount.toLocaleString()}`;
}

/**
 * Return a friendly status message based on the balance (conditional).
 * @param {number} balance
 * @returns {string}
 */
function getBalanceStatus(balance) {
    if (balance < 0) {
        return "⚠️ You have overspent!";
    } else if (balance < 5000) {
        return "⚠️ Your balance is running low.";
    } else {
        return "✅ You're on track.";
    }
}

// ---------- 3. DOM MANIPULATION ----------

/**
 * Update the summary panel with the latest numbers.
 */
function updateSummary() {
    const totalExpenses = calculateTotalExpenses();
    const balance = calculateBalance();

    document.getElementById("summary-budget").textContent = formatCurrency(monthlyBudget);
    document.getElementById("summary-expenses").textContent = formatCurrency(totalExpenses);
    document.getElementById("summary-balance").textContent = formatCurrency(balance);

    const statusEl = document.getElementById("summary-status");
    statusEl.textContent = getBalanceStatus(balance);

    // Add a class based on status for styling (conditional)
    if (balance < 0) {
        statusEl.className = "summary-status danger";
    } else if (balance < 5000) {
        statusEl.className = "summary-status warning";
    } else {
        statusEl.className = "summary-status ok";
    }
}

/**
 * Render the list of expenses on the page using a loop.
 */
function renderExpenses() {
    const listEl = document.getElementById("expense-list");
    listEl.innerHTML = "";  // clear before re-rendering

    if (expenses.length === 0) {
        listEl.innerHTML = "<li class='empty'>No expenses yet.</li>";
        return;
    }

    for (let i = 0; i < expenses.length; i++) {
        const expense = expenses[i];
        const li = document.createElement("li");
        li.className = "expense-item";
        li.innerHTML = `
            <span class="expense-name">${expense.name}</span>
            <span class="expense-category">${expense.category}</span>
            <span class="expense-amount">${formatCurrency(expense.amount)}</span>
        `;
        listEl.appendChild(li);
    }
}

// ---------- 4. EVENT HANDLING ----------

/**
 * Handle the "Add Expense" form submission.
 */
function handleAddExpense(event) {
    event.preventDefault(); // stop the page from reloading

    const nameInput = document.getElementById("expense-name");
    const amountInput = document.getElementById("expense-amount");
    const categoryInput = document.getElementById("expense-category");

    const name = nameInput.value.trim();
    const amount = Number(amountInput.value);
    const category = categoryInput.value;

    // Conditional validation
    if (name === "" || category === "" || isNaN(amount) || amount <= 0) {
        alert("Please fill in all fields with valid values.");
        return;
    }

    // Add the new expense object to the array
    expenses.push({ name: name, amount: amount, category: category });

    // Reset the form for the next entry
    event.target.reset();

    // Update the UI
    updateSummary();
    renderExpenses();
}

// ---------- 5. INITIALIZATION ----------

// Attach the event listener to the form
document.getElementById("expense-form").addEventListener("submit", handleAddExpense);

// First render when the page loads
updateSummary();
renderExpenses();