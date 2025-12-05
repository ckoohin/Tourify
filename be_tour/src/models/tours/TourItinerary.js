const { query } = require("../../config/db");

class TourItinerary {
  static async getByTourVersion(tourVersionId) {
    try {
      const sql = `
                SELECT 
                    id,
                    tour_version_id,
                    day_number,
                    title,
                    description,
                    activities,
                    meals,
                    accommodation,
                    notes,
                    created_at,
                    updated_at
                FROM tour_itineraries
                WHERE tour_version_id = ?
                ORDER BY day_number ASC
            `;
      const results = await query(sql, [tourVersionId]);

      return results.map((item) => ({
        ...item,
        activities: Array.isArray(item.activities) ? item.activities : [],
        meals: item.meals && typeof item.meals === 'object' ? item.meals : {},
      }));
    } catch (error) {
      throw error;
    }
  }

  static async getById(id) {
    try {
      const sql = `
            SELECT 
                id,
                tour_version_id,
                day_number,
                title,
                description,
                activities,
                meals,
                accommodation,
                notes,
                created_at,
                updated_at
            FROM tour_itineraries
            WHERE id = ?
        `;
      const results = await query(sql, [id]);

      if (results.length === 0) {
        return null;
      }

      const itinerary = results[0];

      const parseIfString = (value) => {
        if (typeof value === "string") {
          try {
            return JSON.parse(value);
          } catch (e) {
            console.error("JSON parse error:", e, "Value:", value);
            return value; 
          }
        }
        return value;
      };

      return {
        ...itinerary,
        activities: Array.isArray(itinerary.activities)
          ? itinerary.activities
          : parseIfString(itinerary.activities) || [],
        meals:
          itinerary.meals && typeof itinerary.meals === "object"
            ? itinerary.meals
            : parseIfString(itinerary.meals) || {},
      };
    } catch (error) {
      throw error;
    }
  }

  static async create(data) {
    try {
      const {
        tour_version_id,
        day_number,
        title,
        description,
        activities,
        meals,
        accommodation,
        notes,
      } = data;

      const sql = `
                INSERT INTO tour_itineraries (
                    tour_version_id,
                    day_number,
                    title,
                    description,
                    activities,
                    meals,
                    accommodation,
                    notes
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `;

      const result = await query(sql, [
        tour_version_id,
        day_number,
        title || null,
        description || null,
        activities ? JSON.stringify(activities) : null,
        meals ? JSON.stringify(meals) : null,
        accommodation || null,
        notes || null,
      ]);

      return result.insertId;
    } catch (error) {
      throw error;
    }
  }

  static async update(id, data) {
    try {
      const {
        day_number,
        title,
        description,
        activities,
        meals,
        accommodation,
        notes,
      } = data;

      const sql = `
                UPDATE tour_itineraries
                SET 
                    day_number = ?,
                    title = ?,
                    description = ?,
                    activities = ?,
                    meals = ?,
                    accommodation = ?,
                    notes = ?
                WHERE id = ?
            `;

      const result = await query(sql, [
        day_number,
        title || null,
        description || null,
        activities ? JSON.stringify(activities) : null,
        meals ? JSON.stringify(meals) : null,
        accommodation || null,
        notes || null,
        id,
      ]);

      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  static async delete(id) {
    try {
      const sql = "DELETE FROM tour_itineraries WHERE id = ?";
      const result = await query(sql, [id]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  static async deleteByTourVersion(tourVersionId) {
    try {
      const sql = "DELETE FROM tour_itineraries WHERE tour_version_id = ?";
      const result = await query(sql, [tourVersionId]);
      return result.affectedRows;
    } catch (error) {
      throw error;
    }
  }

  static async isDayNumberExists(tourVersionId, dayNumber, excludeId = null) {
    try {
      let sql = `
                SELECT id 
                FROM tour_itineraries 
                WHERE tour_version_id = ? AND day_number = ?
            `;
      const params = [tourVersionId, dayNumber];

      if (excludeId) {
        sql += " AND id != ?";
        params.push(excludeId);
      }

      const results = await query(sql, params);
      return results.length > 0;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = TourItinerary;