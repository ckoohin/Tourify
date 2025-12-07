const cron = require('node-cron');
const GuestActivityCheckin = require('../../models/tours/GuestActivityCheckin');
const ItineraryActivity = require('../../models/tours/ItineraryActivity');
const { query } = require('../../config/db');

class ActivityCheckinJob {
  static startAutoCheckInJob() {
    cron.schedule('*/5 * * * *', async () => {
      try {
        console.log('[CRON] Running auto check-in job...');
        const autoChecked = await GuestActivityCheckin.autoCheckIn();
        console.log(`[CRON] Auto checked-in ${autoChecked} records`);
      } catch (error) {
        console.error('[CRON] Auto check-in error:', error);
      }
    });
    console.log('[CRON] Auto check-in job scheduled (every 5 minutes)');
  }

  static startAutoMarkMissedJob() {
    cron.schedule('*/10 * * * *', async () => {
      try {
        console.log('[CRON] Running auto mark missed job...');
        const autoMissed = await GuestActivityCheckin.autoMarkMissed();
        console.log(`[CRON] Auto marked ${autoMissed} records as missed`);
      } catch (error) {
        console.error('[CRON] Auto mark missed error:', error);
      }
    });
    console.log('[CRON] Auto mark missed job scheduled (every 10 minutes)');
  }

  static startAutoUpdateActivityStatusJob() {
    cron.schedule('*/5 * * * *', async () => {
      try {
        console.log('[CRON] Running auto update activity status job...');
        
        const activeDepartures = await query(`
          SELECT id 
          FROM tour_departures 
          WHERE status IN ('confirmed', 'in_progress')
            AND departure_date <= CURDATE()
            AND return_date >= CURDATE()
        `);

        let totalUpdated = 0;
        for (const departure of activeDepartures) {
          await ItineraryActivity.autoUpdateActivityStatus(departure.id);
          totalUpdated++;
        }
        
        console.log(`[CRON] Updated activity status for ${totalUpdated} departures`);
      } catch (error) {
        console.error('[CRON] Auto update activity status error:', error);
      }
    });
    console.log('[CRON] Auto update activity status job scheduled (every 5 minutes)');
  }

  // Tổng hợp báo cáo hàng ngày (chạy lúc 23:00)
  static startDailyReportJob() {
    cron.schedule('0 23 * * *', async () => {
      try {
        console.log('[CRON] Running daily attendance report job...');
      } catch (error) {
        console.error('[CRON] Daily report error:', error);
      }
    });
    console.log('[CRON] Daily report job scheduled (23:00 every day)');
  }

  static start() {
    this.startAutoCheckInJob();
    this.startAutoMarkMissedJob();
    this.startAutoUpdateActivityStatusJob();
    this.startDailyReportJob();
    console.log('[CRON] All activity check-in jobs started');
  }
}

module.exports = ActivityCheckinJob;