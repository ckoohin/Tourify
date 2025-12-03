const { query } = require("../../config/db");
class Debt {
  static async getDebts({
    debtType,
    debtorType,
    debtorId,
    status,
    dueFromDate,
    dueToDate,
    page = 1,
    limit = 10,
  }) {
    const offset = (page - 1) * limit;
    const conditions = [];
    const params = [];

    if (debtType) {
      conditions.push("d.debt_type = ?");
      params.push(debtType);
    }

    if (debtorType) {
      conditions.push("d.debtor_type = ?");
      params.push(debtorType);
    }

    if (debtorId) {
      conditions.push("d.debtor_id = ?");
      params.push(debtorId);
    }

    if (status) {
      conditions.push("d.status = ?");
      params.push(status);
    }

    if (dueFromDate) {
      conditions.push("d.due_date >= ?");
      params.push(dueFromDate);
    }

    if (dueToDate) {
      conditions.push("d.due_date <= ?");
      params.push(dueToDate);
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const countSql = `SELECT COUNT(*) as total FROM debts d ${whereClause}`;
    const [countResult] = await query(countSql, params);
    const total = countResult.total;

    const sql = `
      SELECT 
        d.*,
        CASE 
          WHEN d.debtor_type = 'customer' THEN c.full_name
          WHEN d.debtor_type = 'supplier' THEN s.company_name
        END as debtor_name,
        CASE 
          WHEN d.debtor_type = 'customer' THEN c.phone
          WHEN d.debtor_type = 'supplier' THEN s.phone
        END as debtor_phone,
        b.booking_code,
        i.invoice_number
      FROM debts d
      LEFT JOIN customers c ON d.debtor_type = 'customer' AND d.debtor_id = c.id
      LEFT JOIN suppliers s ON d.debtor_type = 'supplier' AND d.debtor_id = s.id
      LEFT JOIN bookings b ON d.booking_id = b.id
      LEFT JOIN invoices i ON d.invoice_id = i.id
      ${whereClause}
      ORDER BY d.due_date ASC, d.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    params.push(limit, offset);
    const debts = await query(sql, params);

    return { debts, total };
  }

  static async getDebtById(id) {
    const sql = `
      SELECT 
        d.*,
        CASE 
          WHEN d.debtor_type = 'customer' THEN c.full_name
          WHEN d.debtor_type = 'supplier' THEN s.company_name
        END as debtor_name,
        CASE 
          WHEN d.debtor_type = 'customer' THEN c.phone
          WHEN d.debtor_type = 'supplier' THEN s.phone
        END as debtor_phone,
        CASE 
          WHEN d.debtor_type = 'customer' THEN c.email
          WHEN d.debtor_type = 'supplier' THEN s.email
        END as debtor_email,
        b.booking_code,
        i.invoice_number
      FROM debts d
      LEFT JOIN customers c ON d.debtor_type = 'customer' AND d.debtor_id = c.id
      LEFT JOIN suppliers s ON d.debtor_type = 'supplier' AND d.debtor_id = s.id
      LEFT JOIN bookings b ON d.booking_id = b.id
      LEFT JOIN invoices i ON d.invoice_id = i.id
      WHERE d.id = ?
    `;
    
    const [debt] = await query(sql, [id]);
    return debt;
  }

  static async createDebt(data) {
    const {
      debtType,
      debtorType,
      debtorId,
      bookingId,
      invoiceId,
      originalAmount,
      currency = "VND",
      dueDate,
      notes,
    } = data;

    if (!debtType || !debtorType || !debtorId || !originalAmount) {
      throw new Error("Thiếu thông tin bắt buộc");
    }

    if (!["receivable", "payable"].includes(debtType)) {
      throw new Error("Loại công nợ không hợp lệ");
    }

    if (!["customer", "supplier"].includes(debtorType)) {
      throw new Error("Loại đối tượng nợ không hợp lệ");
    }

    if (originalAmount <= 0) {
      throw new Error("Số tiền phải lớn hơn 0");
    }

    const sql = `
      INSERT INTO debts (
        debt_type, debtor_type, debtor_id, booking_id, invoice_id,
        original_amount, currency, due_date, status, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)
    `;

    const params = [
      debtType,
      debtorType,
      debtorId,
      bookingId || null,
      invoiceId || null,
      originalAmount,
      currency,
      dueDate || null,
      notes || null,
    ];

    const result = await query(sql, params);
    return result.insertId;
  }

  static async payDebt(id, paidAmount) {
    if (paidAmount <= 0) {
      throw new Error("Số tiền thanh toán phải lớn hơn 0");
    }

    const [debt] = await query("SELECT * FROM debts WHERE id = ?", [id]);
    if (!debt) {
      throw new Error("Không tìm thấy công nợ");
    }

    const newPaidAmount = parseFloat(debt.paid_amount) + parseFloat(paidAmount);
    const remainingAmount = parseFloat(debt.original_amount) - newPaidAmount;

    if (newPaidAmount > parseFloat(debt.original_amount)) {
      throw new Error("Số tiền thanh toán vượt quá số nợ");
    }

    let status = "pending";
    if (remainingAmount === 0) {
      status = "paid";
    } else if (newPaidAmount > 0) {
      status = "partial";
    }

    const sql = `
      UPDATE debts 
      SET paid_amount = ?, status = ?
      WHERE id = ?
    `;

    const result = await query(sql, [newPaidAmount, status, id]);
    return result.affectedRows > 0;
  }

  static async updateOverdueDebts() {
    const sql = `
      UPDATE debts 
      SET status = 'overdue'
      WHERE status IN ('pending', 'partial') 
        AND due_date < CURDATE()
    `;
    const result = await query(sql);
    return result.affectedRows;
  }

  static async getDebtsSummary(debtorType = null) {
    const conditions = debtorType ? "WHERE debtor_type = ?" : "";
    const params = debtorType ? [debtorType] : [];

    const sql = `
      SELECT 
        debt_type,
        status,
        COUNT(*) as count,
        SUM(original_amount) as total_original,
        SUM(paid_amount) as total_paid,
        SUM(remaining_amount) as total_remaining,
        currency
      FROM debts
      ${conditions}
      GROUP BY debt_type, status, currency
    `;

    return await query(sql, params);
  }

  static async getUpcomingDebts(days = 7) {
    const sql = `
      SELECT 
        d.*,
        CASE 
          WHEN d.debtor_type = 'customer' THEN c.full_name
          WHEN d.debtor_type = 'supplier' THEN s.company_name
        END as debtor_name,
        DATEDIFF(d.due_date, CURDATE()) as days_until_due
      FROM debts d
      LEFT JOIN customers c ON d.debtor_type = 'customer' AND d.debtor_id = c.id
      LEFT JOIN suppliers s ON d.debtor_type = 'supplier' AND d.debtor_id = s.id
      WHERE d.status IN ('pending', 'partial')
        AND d.due_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL ? DAY)
      ORDER BY d.due_date ASC
    `;

    return await query(sql, [days]);
  }
}

module.exports = Debt;