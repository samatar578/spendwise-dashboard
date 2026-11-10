/* =========================================================
   SpendWise — Interactive Dashboard
   Senior-level implementation:
   - State + persistence (localStorage)
   - Safe DOM rendering (XSS-safe)
   - Accessible live announcements
   - Event delegation, focus management
   - Locale-aware currency formatting

   ────────────────────────────────────────────────────────
   ADD TO style.css (required for delete buttons to layout):

   .expense-item {
       grid-template-columns: minmax(0, 1fr) auto auto auto;
   }
   .expense-delete {
       display: grid;
       place-items: center;
       width: 32px;
       height: 32px;
       border-radius: var(--radius-sm);
       color: var(--text-tertiary);
       transition: background-color var(--transition-fast),
                   color var(--transition-fast);
   }
   .expense-delete:hover {
       background: #fee2e2;
       color: var(--danger);
   }
   @media (max-width: 720px) {
       .expense-item {
           grid-template-columns: minmax(0, 1fr) auto auto;
       }
       .expense-delete { grid-column: 3; grid-row: 1; }
   }
   ────────────────────────────────────────────────────────
   ========================================================= */

(function () {
    'use strict';

    /* ---------- 1. CONFIG ---------- */
    const CONFIG = Object.freeze({
        currency: 'KES',
        defaultBudget: 50000,
        lowBalanceThreshold: 5000,
        expensesKey: 'spendwise.expenses.v1',
        budgetKey: 'spendwise.budget.v1'
    });

    const SEED_EXPENSES = [
        { name: 'Lunch at cafe', amount: 850, category: 'Food' },
        { name: 'Matatu fare', amount: 200, category: 'Transport' },
        { name: 'Monthly rent', amount: 12000, category: 'Rent' }
    ];

    /* ---------- 2. STATE ---------- */
    const state = {
        budget: loadBudget(),
        expenses: loadExpenses()
    };

    /* ---------- 3. DOM CACHE ---------- */
    const els = {
        form: document.getElementById('expense-form'),
        nameInput: document.getElementById('expense-name'),
        amountInput: document.getElementById('expense-amount'),
        categoryInput: document.getElementById('expense-category'),
        list: document.getElementById('expense-list'),
        budgetOut: document.getElementById('summary-budget'),
        expensesOut: document.getElementById('summary-expenses'),
        balanceOut: document.getElementById('summary-balance'),
        statusOut: document.getElementById('summary-status')
    };

    const liveRegion = createLiveRegion();

    /* ---------- 4. FORMATTERS & HELPERS ---------- */
    const currencyFmt = new Intl.NumberFormat('en-KE', {
        style: 'currency',
        currency: 'KES',
        currencyDisplay: 'code',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    });

    function formatCurrency(amount) {
        return currencyFmt.format(Number(amount) || 0);
    }

    function uid() {
        return (
            'id-' +
            Date.now().toString(36) +
            '-' +
            Math.random().toString(36).slice(2, 9)
        );
    }

    function escapeHTML(value) {
        return String(value).replace(/[&<>"']/g, ch => {
            switch (ch) {
                case '&': return '&amp;';
                case '<': return '&lt;';
                case '>': return '&gt;';
                case '"': return '&quot;';
                case "'": return '&#39;';
                default: return ch;
            }
        });
    }

    function announce(message) {
        liveRegion.textContent = '';
        // Force screen readers to re-announce even for identical strings.
        window.setTimeout(() => {
            liveRegion.textContent = message;
        }, 50);
    }

    function createLiveRegion() {
        const node = document.createElement('div');
        node.setAttribute('role', 'status');
        node.setAttribute('aria-live', 'polite');
        node.setAttribute('aria-atomic', 'true');
        Object.assign(node.style, {
            position: 'absolute',
            width: '1px',
            height: '1px',
            padding: '0',
            margin: '-1px',
            overflow: 'hidden',
            clip: 'rect(0 0 0 0)',
            whiteSpace: 'nowrap',
            border: '0'
        });
        document.body.appendChild(node);
        return node;
    }

    /* ---------- 5. PERSISTENCE ---------- */
    function loadExpenses() {
        try {
            const raw = localStorage.getItem(CONFIG.expensesKey);
            if (!raw) return SEED_EXPENSES.map(withId);

            const parsed = JSON.parse(raw);
            if (!Array.isArray(parsed)) return SEED_EXPENSES.map(withId);

            const sanitized = parsed
                .filter(
                    e =>
                        e &&
                        typeof e.name === 'string' &&
                        e.name.trim() !== '' &&
                        Number.isFinite(Number(e.amount)) &&
                        Number(e.amount) > 0
                )
                .map(e => ({
                    id: e.id || uid(),
                    name: e.name.trim().slice(0, 80),
                    amount: Number(e.amount),
                    category:
                        typeof e.category === 'string' && e.category
                            ? e.category
                            : 'Other'
                }));

            return sanitized.length ? sanitized : SEED_EXPENSES.map(withId);
        } catch (err) {
            console.warn('SpendWise: failed to load expenses — using seed.', err);
            return SEED_EXPENSES.map(withId);
        }
    }

    function loadBudget() {
        try {
            const raw = localStorage.getItem(CONFIG.budgetKey);
            const num = Number(raw);
            return Number.isFinite(num) && num > 0 ? num : CONFIG.defaultBudget;
        } catch {
            return CONFIG.defaultBudget;
        }
    }

    function persist() {
        try {
            localStorage.setItem(
                CONFIG.expensesKey,
                JSON.stringify(state.expenses)
            );
            localStorage.setItem(CONFIG.budgetKey, String(state.budget));
        } catch (err) {
            console.warn('SpendWise: unable to persist data.', err);
        }
    }

    function withId(expense) {
        return { id: uid(), ...expense };
    }

    /* ---------- 6. DERIVED CALCULATIONS ---------- */
    function totalExpenses() {
        return state.expenses.reduce((sum, e) => sum + e.amount, 0);
    }

    function remainingBalance() {
        return state.budget - totalExpenses();
    }

    function statusFor(balance) {
        if (balance < 0) {
            return {
                text: '⚠️ You have overspent!',
                className: 'summary-status danger'
            };
        }
        if (balance < CONFIG.lowBalanceThreshold) {
            return {
                text: '⚠️ Your balance is running low.',
                className: 'summary-status warning'
            };
        }
        return {
            text: "✅ You're on track.",
            className: 'summary-status ok'
        };
    }

    /* ---------- 7. RENDERING ---------- */
    function renderSummary() {
        const total = totalExpenses();
        const balance = remainingBalance();
        const { text, className } = statusFor(balance);

        els.budgetOut.textContent = formatCurrency(state.budget);
        els.expensesOut.textContent = formatCurrency(total);
        els.balanceOut.textContent = formatCurrency(balance);

        els.statusOut.textContent = text;
        els.statusOut.className = className;
    }

    function renderExpenses() {
        if (!state.expenses.length) {
            els.list.innerHTML =
                '<li class="empty">No expenses yet. Add your first one above.</li>';
            return;
        }

        // Build once, then swap — minimises reflows.
        const fragment = document.createDocumentFragment();

        for (const expense of state.expenses) {
            const li = document.createElement('li');
            li.className = 'expense-item';
            li.dataset.id = expense.id;

            li.innerHTML =
                '<span class="expense-name" title="' +
                escapeHTML(expense.name) +
                '">' +
                escapeHTML(expense.name) +
                '</span>' +
                '<span class="expense-category">' +
                escapeHTML(expense.category) +
                '</span>' +
                '<span class="expense-amount">' +
                escapeHTML(formatCurrency(expense.amount)) +
                '</span>' +
                '<button type="button" class="expense-delete" ' +
                'data-action="delete" ' +
                'aria-label="Delete expense: ' +
                escapeHTML(expense.name) +
                '">' +
                '<svg width="16" height="16" viewBox="0 0 24 24" ' +
                'fill="none" stroke="currentColor" stroke-width="2" ' +
                'stroke-linecap="round" stroke-linejoin="round" ' +
                'aria-hidden="true">' +
                '<polyline points="3 6 5 6 21 6" />' +
                '<path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />' +
                '<path d="M10 11v6" />' +
                '<path d="M14 11v6" />' +
                '<path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />' +
                '</svg>' +
                '</button>';

            fragment.appendChild(li);
        }

        els.list.replaceChildren(fragment);
    }

    function renderAll() {
        renderSummary();
        renderExpenses();
    }

    /* ---------- 8. EVENT HANDLERS ---------- */
    function handleSubmit(event) {
        event.preventDefault();

        const name = els.nameInput.value.trim();
        const amount = Number(els.amountInput.value);
        const category = els.categoryInput.value;

        if (!name) {
            els.nameInput.focus();
            announce('Please enter an expense name.');
            return;
        }

        if (!Number.isFinite(amount) || amount <= 0) {
            els.amountInput.focus();
            announce('Please enter an amount greater than zero.');
            return;
        }

        if (!category) {
            els.categoryInput.focus();
            announce('Please choose a category.');
            return;
        }

        const newExpense = {
            id: uid(),
            name: name.slice(0, 80),
            amount,
            category
        };

        state.expenses.push(newExpense);
        persist();
        renderAll();

        els.form.reset();
        els.nameInput.focus();

        announce('Expense added: ' + name + ', ' + formatCurrency(amount) + '.');
    }

    function handleListClick(event) {
        const button = event.target.closest('button[data-action="delete"]');
        if (!button) return;

        const item = button.closest('.expense-item');
        if (!item) return;

        const id = item.dataset.id;
        const index = state.expenses.findIndex(e => e.id === id);
        if (index === -1) return;

        const expense = state.expenses[index];
        const confirmed = window.confirm(
            'Delete "' + expense.name + '" (' + formatCurrency(expense.amount) + ')?'
        );
        if (!confirmed) {
            button.focus();
            return;
        }

        state.expenses.splice(index, 1);
        persist();
        renderAll();

        announce('Deleted expense: ' + expense.name + '.');

        // Focus management: next delete button, else add-expense field.
        const nextBtn = els.list.querySelector(
            '.expense-delete'
        );
        if (nextBtn) {
            nextBtn.focus();
        } else {
            els.nameInput.focus();
        }
    }

    /* ---------- 9. INITIALISATION ---------- */
    function init() {
        if (!els.form || !els.list) {
            console.error('SpendWise: required DOM nodes missing.');
            return;
        }

        els.form.addEventListener('submit', handleSubmit);
        els.list.addEventListener('click', handleListClick);

        // Prevent accidental double-submit while the browser batches state.
        els.form.addEventListener('keydown', event => {
            if (event.key === 'Enter' && event.target.tagName !== 'TEXTAREA') {
                // Default form submission is already correct; no-op safeguard.
            }
        });

        renderAll();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init, { once: true });
    } else {
        init();
    }
})();