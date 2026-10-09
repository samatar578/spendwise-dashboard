# SpendWise — Week 6 Interactive Dashboard

SpendWise is a personal budgeting dashboard. This week it became fully interactive — users can now add expenses through a form, and the summary panel updates live on the page.

## Improvements Made This Week
- Added a **live summary panel** showing total budget, total expenses, remaining balance, and a status message.
- Added an **Add Expense form** with name, amount, and category fields.
- Added a **dynamic expense list** that renders every recorded expense on the page.
- Replaced individual variables with a **single array of expense objects**.
- Wired everything together with a **submit event listener**.

## How Conditionals Are Used
The `getBalanceStatus()` function uses `if / else if / else` to decide which message to show based on the remaining balance:
- `< 0` → "You have overspent!"
- `< 5000` → "Your balance is running low."
- otherwise → "You're on track."

A second conditional in `handleAddExpense()` validates the form input before saving.

## How Arrays Are Used
Expenses are stored in a single array of objects:

```javascript
let expenses = [
    { name: "Lunch at cafe", amount: 850, category: "Food" },
    ...
];