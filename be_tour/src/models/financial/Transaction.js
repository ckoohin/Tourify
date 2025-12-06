const { query } = require('../../config/db');

class Transaction {
  static async getTourTransactions({
    tourDepartureId,
    type,
    category,
    startDate,
    endDate,
    page = 1,
    limit = 10
  }) {
    const offset = (page - 1) * limit;
    const conditions = [];
    const params = [];

    if (tourDepartureId) {
      conditions.push('t.tour_departure_id = ?');
      params.push(tourDepartureId);
    }

    if (type) {
      conditions.push('t.type = ?');
      params.push(type);
    }

    if (category) {
      conditions.push('t.category = ?');
      params.push(category);
    }

    if (startDate) {
      conditions.push('t.transaction_date >= ?');
      params.push(startDate);
    }

    if (endDate) {
      conditions.push('t.transaction_date <= ?');
      params.push(endDate);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countSql = `
      SELECT COUNT(*) as total
      FROM transactions t
      ${whereClause}
    `;
    const [countResult] = await query(countSql, params);
    const total = countResult.total;

    const sql = `
      SELECT 
        t.*,
        td.departure_code,
        tv.name as tour_version_name,
        tours.name as tour_name,
        s.company_name as supplier_name,
        b.booking_code,
        u1.name as created_by_name,
        u2.name as approved_by_name
      FROM transactions t
      LEFT JOIN tour_departures td ON t.tour_departure_id = td.id
      LEFT JOIN tour_versions tv ON td.tour_version_id = tv.id
      LEFT JOIN tours ON tv.tour_id = tours.id
      LEFT JOIN suppliers s ON t.supplier_id = s.id
      LEFT JOIN bookings b ON t.booking_id = b.id
      LEFT JOIN users u1 ON t.created_by = u1.id
      LEFT JOIN users u2 ON t.approved_by = u2.id
      ${whereClause}
      ORDER BY t.transaction_date DESC, t.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    params.push(limit, offset);
    const transactions = await query(sql, params);

    return { transactions, total };
  }

  static async getTransactionById(id) {
    const sql = `
      SELECT 
        t.*,
        td.departure_code,
        tv.name as tour_version_name,
        tours.name as tour_name,
        s.company_name as supplier_name,
        b.booking_code,
        u1.name as created_by_name,
        u2.name as approved_by_name
      FROM transactions t
      LEFT JOIN tour_departures td ON t.tour_departure_id = td.id
      LEFT JOIN tour_versions tv ON td.tour_version_id = tv.id
      LEFT JOIN tours ON tv.tour_id = tours.id
      LEFT JOIN suppliers s ON t.supplier_id = s.id
      LEFT JOIN bookings b ON t.booking_id = b.id
      LEFT JOIN users u1 ON t.created_by = u1.id
      LEFT JOIN users u2 ON t.approved_by = u2.id
      WHERE t.id = ?
    `;
    
    const [transaction] = await query(sql, [id]);
    return transaction;
  }

  static async createTransaction(data) {
    const {
      type,
      category,
      bookingId,
      tourDepartureId,
      supplierId,
      amount,
      currency = 'VND',
      transactionDate,
      paymentMethod,
      description,
      referenceNumber,
      receiptUrl,
      createdBy
    } = data;

    if (!type || !category || !amount || !transactionDate || !paymentMethod || !createdBy) {
      throw new Error('Thiếu thông tin bắt buộc');
    }

    if (!['income', 'expense'].includes(type)) {
      throw new Error('Loại giao dịch không hợp lệ');
    }

    if (amount <= 0) {
      throw new Error('Số tiền phải lớn hơn 0');
    }

    const code = await this.generateTransactionCode(type);

    const sql = `
      INSERT INTO transactions (
        code, type, category, booking_id, tour_departure_id, supplier_id,
        amount, currency, transaction_date, payment_method, description,
        reference_number, receipt_url, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      code, type, category, bookingId || null, tourDepartureId || null,
      supplierId || null, amount, currency, transactionDate, paymentMethod,
      description || null, referenceNumber || null, receiptUrl || null, createdBy
    ];

    const result = await query(sql, params);
    return { id: result.insertId, code };
  }

  static async updateTransaction(id, data) {
    const {
      category,
      amount,
      transactionDate,
      paymentMethod,
      description,
      referenceNumber,
      receiptUrl
    } = data;

    const updates = [];
    const params = [];

    if (category) {
      updates.push('category = ?');
      params.push(category);
    }
    if (amount !== undefined) {
      if (amount <= 0) throw new Error('Số tiền phải lớn hơn 0');
      updates.push('amount = ?');
      params.push(amount);
    }
    if (transactionDate) {
      updates.push('transaction_date = ?');
      params.push(transactionDate);
    }
    if (paymentMethod) {
      updates.push('payment_method = ?');
      params.push(paymentMethod);
    }
    if (description !== undefined) {
      updates.push('description = ?');
      params.push(description);
    }
    if (referenceNumber !== undefined) {
      updates.push('reference_number = ?');
      params.push(referenceNumber);
    }
    if (receiptUrl !== undefined) {
      updates.push('receipt_url = ?');
      params.push(receiptUrl);
    }

    if (updates.length === 0) {
      throw new Error('Không có thông tin để cập nhật');
    }

    params.push(id);

    const sql = `
      UPDATE transactions 
      SET ${updates.join(', ')}
      WHERE id = ?
    `;

    const result = await query(sql, params);
    return result.affectedRows > 0;
  }

  static async approveTransaction(id, approvedBy) {
    const sql = `
      UPDATE transactions 
      SET approved_by = ?, approved_at = NOW()
      WHERE id = ?
    `;
    const result = await query(sql, [approvedBy, id]);
    return result.affectedRows > 0;
  }

  static async deleteTransaction(id) {
    const sql = 'DELETE FROM transactions WHERE id = ?';
    const result = await query(sql, [id]);
    return result.affectedRows > 0;
  }

  static async getTourFinancialSummary(tourDepartureId) {
    const sql = `
      SELECT 
        SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as total_income,
        SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as total_expense,
        (SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) - 
         SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END)) as net_profit,
        COUNT(*) as total_transactions,
        currency
      FROM transactions
      WHERE tour_departure_id = ?
      GROUP BY currency
    `;
    
    const result = await query(sql, [tourDepartureId]);
    return result[0] || {
      total_income: 0,
      total_expense: 0,
      net_profit: 0,
      total_transactions: 0,
      currency: 'VND'
    };
  }

  static async generateTransactionCode(type) {
    const prefix = type === 'income' ? 'THU' : 'CHI';
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    
    const sql = `
      SELECT code 
      FROM transactions 
      WHERE code LIKE ? 
      ORDER BY code DESC 
      LIMIT 1
    `;
    
    const pattern = `${prefix}${year}${month}%`;
    const [lastRecord] = await query(sql, [pattern]);
    
    let nextNumber = 1;
    if (lastRecord) {
      const lastNumber = parseInt(lastRecord.code.slice(-4));
      nextNumber = lastNumber + 1;
    }
    
    return `${prefix}${year}${month}${String(nextNumber).padStart(4, '0')}`;
  }
}

module.exports = Transaction;