# SpendWise — Week 6 JavaScript Foundation

SpendWise is a personal budgeting dashboard. In Week 6, we added the JavaScript foundation — the ability to store data, collect user input, perform calculations, and display results.

## What the Project Does
SpendWise helps a user track their monthly budget and expenses. It calculates the remaining balance, the percentage of the budget that has been spent, and displays a friendly status message about their spending.

## JavaScript Concepts Implemented
- **Variables** (`let`) for storing the user's name, budget, expenses, currency symbol, and status.
- **Data types** — strings, numbers, and booleans.
- **Template literals** (backticks) to build friendly, formatted messages.
- **Functions** for reusable, organized logic.
- **User input** via `window.prompt()`.
- **Type conversion** using `Number()` to turn prompt strings into numbers.
- **Validation** using `isNaN()` to detect invalid input.
- **Conditionals** (`if / else if / else`) inside `getBalanceStatus()`.
- **Math and formatting** — `Math.round()`, `toLocaleString()`.

## How Variables Are Used
- `userName` — string, holds the user's name.
- `monthlyBudget` — number, holds the total monthly budget.
- `totalExpenses` — number, holds the running total of expenses.
- `currencySymbol` — string, used to format currency display.
- `isBudgetActive` — boolean, tracks whether the tracker is active.

## How User Input Is Collected
Two `prompt()` dialogs ask the user for:
1. Their monthly budget.
2. A new expense to add.

The inputs arrive as **strings**, so `Number()` converts them to numeric values before any math is done. If the user enters text, `isNaN()` catches it and prints a friendly error.

## How Calculations Are Performed
- **Balance** = `budget - totalExpenses` (see `calculateBalance`)
- **Spent percentage** = `(expenses / budget) * 100` (see `calculateSpentPercentage`)
- **Updated expenses** = `oldExpenses + newExpense`

## How Functions Organize the Code
Four reusable functions keep the logic clean:
- `calculateBalance()` — returns the remaining balance.
- `calculateSpentPercentage()` — returns the % of budget spent.
- `formatCurrency()` — returns a nicely formatted currency string.
- `getBalanceStatus()` — returns a friendly status message.

## How to Run
Open `index.html` in a browser. Open DevTools (F12) → **Console** tab to see the results. Answer the two prompts when they appear.