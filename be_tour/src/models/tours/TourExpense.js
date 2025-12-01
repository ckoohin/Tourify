const { query } = require('../../config/db');

class TourExpense {
  static async create(data, reportedBy) {
    try {
      const {
        tour_departure_id,
        expense_category,
        expense_date,
        amount,
        currency,
        payment_method,
        supplier_id,
        description,
        receipt_url
      } = data;

      const sql = `
        INSERT INTO tour_expenses (
          tour_departure_id,
          expense_category,
          expense_date,
          amount,
          currency,
          payment_method,
          supplier_id,
          description,
          receipt_url,
          reported_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const result = await query(sql, [
        tour_departure_id,
        expense_category,
        expense_date,
        amount,
        currency || 'VND',
        payment_method,
        supplier_id || null,
        description || null,
        receipt_url || null,
        reportedBy
      ]);

      return await this.getById(result.insertId);
    } catch (error) {
      throw error;
    }
  }

  static async getById(id) {
    try {
      const sql = `
        SELECT 
          te.*,
          s.company_name as supplier_name,
          td.departure_code,
          u1.name as reported_by_name,
          u2.name as approved_by_name
        FROM tour_expenses te
        LEFT JOIN suppliers s ON te.supplier_id = s.id
        INNER JOIN tour_departures td ON te.tour_departure_id = td.id
        LEFT JOIN users u1 ON te.reported_by = u1.id
        LEFT JOIN users u2 ON te.approved_by = u2.id
        WHERE te.id = ?
      `;

      const [expense] = await query(sql, [id]);
      return expense || null;
    } catch (error) {
      throw error;
    }
  }

  static async update(id, data) {
    try {
      const {
        expense_category,
        expense_date,
        amount,
        payment_method,
        supplier_id,
        description,
        receipt_url
      } = data;

      const sql = `
        UPDATE tour_expenses
        SET 
          expense_category = ?,
          expense_date = ?,
          amount = ?,
          payment_method = ?,
          supplier_id = ?,
          description = ?,
          receipt_url = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;

      await query(sql, [
        expense_category,
        expense_date,
        amount,
        payment_method,
        supplier_id || null,
        description || null,
        receipt_url || null,
        id
      ]);

      return await this.getById(id);
    } catch (error) {
      throw error;
    }
  }

  static async approve(id, approvedBy) {
    try {
      const sql = `
        UPDATE tour_expenses
        SET 
          approved_by = ?,
          approved_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;

      await query(sql, [approvedBy, id]);
      return await this.getById(id);
    } catch (error) {
      throw error;
    }
  }

  static async delete(id) {
    try {
      const sql = 'DELETE FROM tour_expenses WHERE id = ?';
      await query(sql, [id]);
      return true;
    } catch (error) {
      throw error;
    }
  }

  static async getByDepartureId(departureId) {
    try {
      const sql = `
        SELECT 
          te.*,
          s.company_name as supplier_name,
          u1.name as reported_by_name,
          u2.name as approved_by_name
        FROM tour_expenses te
        LEFT JOIN suppliers s ON te.supplier_id = s.id
        LEFT JOIN users u1 ON te.reported_by = u1.id
        LEFT JOIN users u2 ON te.approved_by = u2.id
        WHERE te.tour_departure_id = ?
        ORDER BY te.expense_date DESC, te.created_at DESC
      `;

      const expenses = await query(sql, [departureId]);
      return expenses;
    } catch (error) {
      throw error;
    }
  }

  static async compareWithBudget(departureId) {
    try {
      const actualSql = `
        SELECT 
          expense_category,
          SUM(amount) as actual_amount,
          currency
        FROM tour_expenses
        WHERE tour_departure_id = ?
        GROUP BY expense_category, currency
      `;
      const actualExpenses = await query(actualSql, [departureId]);

      const budgetSql = `
        SELECT 
          budget_category,
          estimated_amount,
          currency
        FROM tour_budgets
        WHERE tour_departure_id = ?
      `;
      const budgets = await query(budgetSql, [departureId]);

      const comparison = budgets.map(budget => {
        const actual = actualExpenses.find(
          e => e.expense_category === budget.budget_category && 
               e.currency === budget.currency
        );

        const actualAmount = actual ? actual.actual_amount : 0;
        const estimatedAmount = budget.estimated_amount;
        const difference = actualAmount - estimatedAmount;
        const percentDiff = estimatedAmount > 0 
          ? ((difference / estimatedAmount) * 100).toFixed(2) 
          : 0;

        return {
          category: budget.budget_category,
          currency: budget.currency,
          estimated_amount: estimatedAmount,
          actual_amount: actualAmount,
          difference: difference,
          percent_difference: percentDiff,
          status: difference > 0 ? 'over' : (difference < 0 ? 'under' : 'match')
        };
      });

      const totalEstimated = budgets.reduce((sum, b) => sum + parseFloat(b.estimated_amount), 0);
      const totalActual = actualExpenses.reduce((sum, e) => sum + parseFloat(e.actual_amount), 0);

      return {
        details: comparison,
        summary: {
          total_estimated: totalEstimated,
          total_actual: totalActual,
          total_difference: totalActual - totalEstimated,
          total_percent_difference: totalEstimated > 0 
            ? (((totalActual - totalEstimated) / totalEstimated) * 100).toFixed(2)
            : 0
        }
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = TourExpense;