/* =========================================================
   SpendWise — Interactive Logic (Professional Edition)
   ========================================================= */

(function () {
    'use strict';

    const CONFIG = {
        currency: 'KES',
        defaultBudget: 50000,
        lowBalanceThreshold: 5000,
        expensesKey: 'spendwise.expenses.v1',
        budgetKey: 'spendwise.budget.v1'
    };

    const SEED_EXPENSES = [
        { id: '1', name: 'Lunch at cafe', amount: 850, category: 'Food' },
        { id: '2', name: 'Matatu fare', amount: 200, category: 'Transport' },
        { id: '3', name: 'Monthly rent', amount: 12000, category: 'Rent' }
    ];

    // DOM Elements
    const els = {
        form: document.getElementById('expense-form'),
        name: document.getElementById('expense-name'),
        amount: document.getElementById('expense-amount'),
        category: document.getElementById('expense-category'),
        list: document.getElementById('expense-list'),
        ui: {
            budget: document.getElementById('stat-budget'),
            expenses: document.getElementById('stat-expenses'),
            balance: document.getElementById('stat-balance'),
            status: document.getElementById('summary-status'),
            progressBar: document.getElementById('progress-bar'),
            progressPct: document.getElementById('progress-percentage')
        }
    };

    // State
    let state = {
        budget: loadBudget(),
        expenses: loadExpenses()
    };

    const currencyFmt = new Intl.NumberFormat('en-KE', {
        style: 'currency', currency: 'KES', currencyDisplay: 'code', maximumFractionDigits: 0
    });

    // --- HELPERS ---
    function loadExpenses() {
        try {
            const raw = localStorage.getItem(CONFIG.expensesKey);
            return raw ? JSON.parse(raw) : SEED_EXPENSES;
        } catch { return SEED_EXPENSES; }
    }

    function loadBudget() {
        const raw = localStorage.getItem(CONFIG.budgetKey);
        return raw ? Number(raw) : CONFIG.defaultBudget;
    }

    function save() {
        localStorage.setItem(CONFIG.expensesKey, JSON.stringify(state.expenses));
        localStorage.setItem(CONFIG.budgetKey, String(state.budget));
    }

    function escapeHTML(str) {
        return String(str).replace(/[&<>"']/g, m => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
        }[m]));
    }

    // --- RENDER ---
    function render() {
        const total = state.expenses.reduce((sum, e) => sum + e.amount, 0);
        const balance = state.budget - total;
        const pct = Math.min((total / state.budget) * 100, 100).toFixed(1);

        // Update KPI Cards
        els.ui.budget.textContent = currencyFmt.format(state.budget);
        els.ui.expenses.textContent = currencyFmt.format(total);
        els.ui.balance.textContent = currencyFmt.format(balance);

        // Update Progress Bar
        els.ui.progressBar.style.width = `${pct}%`;
        els.ui.progressPct.textContent = `${pct}% Used`;
        
        // Update Status & Colors
        els.ui.progressBar.className = 'progress-fill';
        els.ui.status.className = 'summary-status';

        if (balance < 0) {
            els.ui.status.textContent = '⚠️ Overspent';
            els.ui.status.classList.add('danger');
            els.ui.progressBar.classList.add('danger');
        } else if (balance < CONFIG.lowBalanceThreshold) {
            els.ui.status.textContent = '⚠️ Running low';
            els.ui.status.classList.add('warning');
            els.ui.progressBar.classList.add('warning');
        } else {
            els.ui.status.textContent = '✅ On track';
            els.ui.status.classList.add('ok');
        }

        // Render Table
        if (state.expenses.length === 0) {
            els.list.innerHTML = '<tr><td colspan="4" class="empty">No expenses recorded yet.</td></tr>';
            return;
        }

        els.list.innerHTML = state.expenses.map(e => `
            <tr>
                <td class="expense-name">${escapeHTML(e.name)}</td>
                <td><span class="expense-category">${escapeHTML(e.category)}</span></td>
                <td class="expense-amount">${currencyFmt.format(e.amount)}</td>
                <td class="text-right">
                    <button class="btn-delete" data-id="${e.id}" aria-label="Delete ${escapeHTML(e.name)}">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    // --- EVENTS ---
    els.form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const name = els.name.value.trim();
        const amount = Number(els.amount.value);
        const category = els.category.value;

        if (!name || amount <= 0 || !category) {
            alert('Please fill out all fields correctly.');
            return;
        }

        state.expenses.unshift({
            id: Date.now().toString(),
            name,
            amount,
            category
        });

        save();
        render();
        els.form.reset();
        els.name.focus();
    });

    els.list.addEventListener('click', (e) => {
        const btn = e.target.closest('.btn-delete');
        if (!btn) return;

        if (confirm('Are you sure you want to delete this expense?')) {
            const id = btn.dataset.id;
            state.expenses = state.expenses.filter(exp => exp.id !== id);
            save();
            render();
        }
    });

    // Init
    render();
})();