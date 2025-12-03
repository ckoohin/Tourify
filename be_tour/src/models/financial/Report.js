const { query } = require("../../config/db");
class Report{
    static async getTourProfitReport(tourDepartureId) {
    const revenueSql = `
      SELECT 
        COALESCE(SUM(b.total_amount), 0) as booking_revenue,
        COALESCE(SUM(b.paid_amount), 0) as booking_paid,
        COALESCE(SUM(b.remaining_amount), 0) as booking_remaining,
        COUNT(DISTINCT b.id) as total_bookings,
        SUM(b.total_guests) as total_guests
      FROM bookings b
      WHERE b.tour_version_id IN (
        SELECT tour_version_id FROM tour_departures WHERE id = ?
      )
      AND b.departure_date = (
        SELECT departure_date FROM tour_departures WHERE id = ?
      )
      AND b.status NOT IN ('cancelled')
    `;
    const [revenueData] = await query(revenueSql, [tourDepartureId, tourDepartureId]);

    const incomeSql = `
      SELECT 
        COALESCE(SUM(amount), 0) as transaction_income
      FROM transactions
      WHERE tour_departure_id = ? AND type = 'income'
    `;
    const [incomeData] = await query(incomeSql, [tourDepartureId]);

    const expenseSql = `
      SELECT 
        category,
        SUM(amount) as amount
      FROM transactions
      WHERE tour_departure_id = ? AND type = 'expense'
      GROUP BY category
    `;
    const expensesByCategory = await query(expenseSql, [tourDepartureId]);

    const serviceExpenseSql = `
      SELECT 
        COALESCE(SUM(total_amount), 0) as service_expense
      FROM service_bookings
      WHERE tour_departure_id = ?
    `;
    const [serviceExpenseData] = await query(serviceExpenseSql, [tourDepartureId]);

    const tourExpenseSql = `
      SELECT 
        expense_category,
        SUM(amount) as amount
      FROM tour_expenses
      WHERE tour_departure_id = ?
      GROUP BY expense_category
    `;
    const tourExpenses = await query(tourExpenseSql, [tourDepartureId]);

    const debtSql = `
      SELECT 
        debt_type,
        SUM(remaining_amount) as total_remaining
      FROM debts
      WHERE booking_id IN (
        SELECT id FROM bookings 
        WHERE tour_version_id IN (
          SELECT tour_version_id FROM tour_departures WHERE id = ?
        )
        AND departure_date = (
          SELECT departure_date FROM tour_departures WHERE id = ?
        )
      )
      GROUP BY debt_type
    `;
    const debts = await query(debtSql, [tourDepartureId, tourDepartureId]);

    const totalRevenue = parseFloat(revenueData.booking_revenue) + parseFloat(incomeData.transaction_income);
    const totalExpense = expensesByCategory.reduce((sum, item) => sum + parseFloat(item.amount), 0) +
                        parseFloat(serviceExpenseData.service_expense) +
                        tourExpenses.reduce((sum, item) => sum + parseFloat(item.amount), 0);
    const netProfit = totalRevenue - totalExpense;
    const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue * 100).toFixed(2) : 0;

    return {
      tour_departure_id: tourDepartureId,
      revenue: {
        booking_revenue: parseFloat(revenueData.booking_revenue),
        transaction_income: parseFloat(incomeData.transaction_income),
        total: totalRevenue
      },
      expense: {
        transactions: expensesByCategory,
        service_bookings: parseFloat(serviceExpenseData.service_expense),
        tour_expenses: tourExpenses,
        total: totalExpense
      },
      booking_info: {
        total_bookings: revenueData.total_bookings,
        total_guests: revenueData.total_guests,
        paid_amount: parseFloat(revenueData.booking_paid),
        remaining_amount: parseFloat(revenueData.booking_remaining)
      },
      debts: debts,
      profit: {
        net_profit: netProfit,
        profit_margin: parseFloat(profitMargin)
      }
    };
  }

  static async getProfitReportByPeriod(startDate, endDate) {
    const sql = `
      SELECT 
        td.id as tour_departure_id,
        td.departure_code,
        tours.name as tour_name,
        td.departure_date,
        td.confirmed_guests,
        COALESCE(SUM(CASE WHEN t.type = 'income' THEN t.amount ELSE 0 END), 0) as total_income,
        COALESCE(SUM(CASE WHEN t.type = 'expense' THEN t.amount ELSE 0 END), 0) as total_expense,
        (COALESCE(SUM(CASE WHEN t.type = 'income' THEN t.amount ELSE 0 END), 0) - 
         COALESCE(SUM(CASE WHEN t.type = 'expense' THEN t.amount ELSE 0 END), 0)) as net_profit
      FROM tour_departures td
      INNER JOIN tour_versions tv ON td.tour_version_id = tv.id
      INNER JOIN tours ON tv.tour_id = tours.id
      LEFT JOIN transactions t ON td.id = t.tour_departure_id
      WHERE td.departure_date BETWEEN ? AND ?
      GROUP BY td.id, td.departure_code, tours.name, td.departure_date, td.confirmed_guests
      ORDER BY td.departure_date DESC
    `;

    return await query(sql, [startDate, endDate]);
  }
}
module.exports = Report;