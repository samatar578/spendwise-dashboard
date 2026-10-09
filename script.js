// =========================================================
// SpendWise — Week 6 JavaScript Foundation
// Variables, user input, calculations, and functions
// =========================================================

// ---------- 1. STORE APPLICATION DATA (variables) ----------
// These represent SpendWise's core budgeting data.
let userName = "Samatar";              // string
let monthlyBudget = 50000;             // number — total budget in KES
let totalExpenses = 15000;             // number — initial expenses
let currencySymbol = "KES";            // string — used for formatting
let isBudgetActive = true;             // boolean — is the tracker active?

console.log("=== SpendWise Budget Tracker ===");
console.log(`Welcome, ${userName}!`);
console.log(`Starting monthly budget: ${currencySymbol} ${monthlyBudget}`);
console.log(`Starting expenses: ${currencySymbol} ${totalExpenses}`);

// ---------- 2. REUSABLE FUNCTIONS ----------

/**
 * Calculates the remaining balance.
 * @param {number} budget - The monthly budget
 * @param {number} expenses - Total expenses so far
 * @returns {number} Remaining balance
 */
function calculateBalance(budget, expenses) {
    return budget - expenses;
}

/**
 * Calculates what percentage of the budget has been spent.
 * @param {number} budget - The monthly budget
 * @param {number} expenses - Total expenses so far
 * @returns {number} Percentage spent (rounded to 1 decimal place)
 */
function calculateSpentPercentage(budget, expenses) {
    if (budget === 0) return 0; // avoid division by zero
    return Math.round((expenses / budget) * 100 * 10) / 10;
}

/**
 * Formats a number as a currency string.
 * @param {number} amount - The amount to format
 * @returns {string} Formatted currency string
 */
function formatCurrency(amount) {
    return `${currencySymbol} ${amount.toLocaleString()}`;
}

/**
 * Returns a status message based on the balance.
 * @param {number} balance - The remaining balance
 * @returns {string} A friendly status message
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

// ---------- 3. DISPLAY INITIAL RESULTS ----------
let initialBalance = calculateBalance(monthlyBudget, totalExpenses);
console.log("\n--- Current Status ---");
console.log(`Remaining balance: ${formatCurrency(initialBalance)}`);
console.log(`Spent: ${calculateSpentPercentage(monthlyBudget, totalExpenses)}% of budget`);
console.log(getBalanceStatus(initialBalance));

// ---------- 4. COLLECT USER INPUT ----------
// Ask the user for their budget and a new expense using prompts.
// Note: window.prompt returns a string, so we convert with Number().

console.log("\n--- New Entry ---");

let userBudgetInput = prompt("What is your monthly budget? (numbers only)", "50000");
let userExpenseInput = prompt("Enter a new expense amount:", "3000");

// Convert strings to numbers
let userBudget = Number(userBudgetInput);
let newExpense = Number(userExpenseInput);

// Validate the input
if (isNaN(userBudget) || isNaN(newExpense)) {
    console.log("❌ Invalid input. Please enter numeric values only.");
} else {
    // Update the application data
    monthlyBudget = userBudget;
    totalExpenses = totalExpenses + newExpense;

    // Recalculate and display
    let newBalance = calculateBalance(monthlyBudget, totalExpenses);
    let spentPercent = calculateSpentPercentage(monthlyBudget, totalExpenses);

    console.log(`\nUser entered budget: ${formatCurrency(monthlyBudget)}`);
    console.log(`New expense added: ${formatCurrency(newExpense)}`);
    console.log(`Total expenses: ${formatCurrency(totalExpenses)}`);
    console.log(`Updated balance: ${formatCurrency(newBalance)}`);
    console.log(`Spent: ${spentPercent}% of budget`);
    console.log(getBalanceStatus(newBalance));
}

console.log("\n=== End of SpendWise report ===");