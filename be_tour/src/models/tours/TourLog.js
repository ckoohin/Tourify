const { query } = require('../../config/db');

class TourLog {
  static async create(data, createdBy) {
    try {
      const {
        tour_departure_id,
        log_date,
        log_time,
        day_number,
        log_type,
        title,
        content,
        images,
        location,
        weather
      } = data;

      const sql = `
        INSERT INTO tour_logs (
          tour_departure_id,
          log_date,
          log_time,
          day_number,
          log_type,
          title,
          content,
          images,
          location,
          weather,
          created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const result = await query(sql, [
        tour_departure_id,
        log_date,
        log_time || null,
        day_number || null,
        log_type || 'note',
        title || null,
        content,
        images ? JSON.stringify(images) : null,
        location || null,
        weather || null,
        createdBy
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
          tl.*,
          td.departure_code,
          u.name as created_by_name
        FROM tour_logs tl
        INNER JOIN tour_departures td ON tl.tour_departure_id = td.id
        LEFT JOIN users u ON tl.created_by = u.id
        WHERE tl.id = ?
      `;

      const [log] = await query(sql, [id]);
      
      if (log && log.images) {
        try {
          log.images = JSON.parse(log.images);
        } catch (e) {
          log.images = [];
        }
      }

      return log || null;
    } catch (error) {
      throw error;
    }
  }

  static async update(id, data) {
    try {
      const {
        log_date,
        log_time,
        day_number,
        log_type,
        title,
        content,
        images,
        location,
        weather
      } = data;

      const sql = `
        UPDATE tour_logs
        SET 
          log_date = ?,
          log_time = ?,
          day_number = ?,
          log_type = ?,
          title = ?,
          content = ?,
          images = ?,
          location = ?,
          weather = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;

      await query(sql, [
        log_date,
        log_time || null,
        day_number || null,
        log_type,
        title || null,
        content,
        images ? JSON.stringify(images) : null,
        location || null,
        weather || null,
        id
      ]);

      return await this.getById(id);
    } catch (error) {
      throw error;
    }
  }

  static async delete(id) {
    try {
      const sql = 'DELETE FROM tour_logs WHERE id = ?';
      await query(sql, [id]);
      return true;
    } catch (error) {
      throw error;
    }
  }

  static async getByDepartureId(departureId, { page = 1, limit = 20, log_type }) {
    try {
      const offset = (page - 1) * limit;
      let whereConditions = ['tl.tour_departure_id = ?'];
      let params = [departureId];

      if (log_type) {
        whereConditions.push('tl.log_type = ?');
        params.push(log_type);
      }

      const whereClause = whereConditions.join(' AND ');

      const countSql = `
        SELECT COUNT(*) as total
        FROM tour_logs tl
        WHERE ${whereClause}
      `;
      const [countResult] = await query(countSql, params);
      const total = countResult.total;

      const sql = `
        SELECT 
          tl.*,
          u.name as created_by_name
        FROM tour_logs tl
        LEFT JOIN users u ON tl.created_by = u.id
        WHERE ${whereClause}
        ORDER BY tl.log_date DESC, tl.log_time DESC, tl.created_at DESC
        LIMIT ? OFFSET ?
      `;
      params.push(limit, offset);

      const logs = await query(sql, params);

      logs.forEach(log => {
        if (log.images) {
          try {
            log.images = JSON.parse(log.images);
          } catch (e) {
            log.images = [];
          }
        }
      });

      return {
        data: logs,
        pagination: {
          currentPage: page,
          pageSize: limit,
          totalItems: total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw error;
    }
  }

  static async getByDate(departureId, date) {
    try {
      const sql = `
        SELECT 
          tl.*,
          u.name as created_by_name
        FROM tour_logs tl
        LEFT JOIN users u ON tl.created_by = u.id
        WHERE tl.tour_departure_id = ?
        AND tl.log_date = ?
        ORDER BY tl.log_time, tl.created_at
      `;

      const logs = await query(sql, [departureId, date]);

      logs.forEach(log => {
        if (log.images) {
          try {
            log.images = JSON.parse(log.images);
          } catch (e) {
            log.images = [];
          }
        }
      });

      return logs;
    } catch (error) {
      throw error;
    }
  }

  static async getIncidentsAndFeedback(departureId) {
    try {
      const sql = `
        SELECT 
          tl.*,
          u.name as created_by_name
        FROM tour_logs tl
        LEFT JOIN users u ON tl.created_by = u.id
        WHERE tl.tour_departure_id = ?
        AND tl.log_type IN ('incident', 'feedback')
        ORDER BY tl.log_date DESC, tl.log_time DESC
      `;

      const logs = await query(sql, [departureId]);

      logs.forEach(log => {
        if (log.images) {
          try {
            log.images = JSON.parse(log.images);
          } catch (e) {
            log.images = [];
          }
        }
      });

      return logs;
    } catch (error) {
      throw error;
    }
  }

  static async getStats(departureId) {
    try {
      const sql = `
        SELECT 
          log_type,
          COUNT(*) as count
        FROM tour_logs
        WHERE tour_departure_id = ?
        GROUP BY log_type
      `;

      const stats = await query(sql, [departureId]);
      return stats;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = TourLog;