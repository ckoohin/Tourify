import api from './axios'; // Giả sử bạn đã có instance axios

const checkinService = {
    // Luồng 1: Khởi tạo
    initializeCheckins: (departureId) => 
        api.post(`/activity-checkins/departures/${departureId}/initialize`),

    // Luồng 4A: Lấy hoạt động đang diễn ra (cho trang chủ Dashboard)
    getActiveCheckins: (departureId) => 
        api.get(`/activity-checkins/departures/${departureId}/active`),

    // Lấy hoạt động theo ngày (cho màn hình điểm danh chính)
    getActivitiesByDate: (departureId, date) => 
        api.get(`/activity-checkins/departures/${departureId}/by-date`, { params: { date } }),

    // Luồng 4B: Thống kê
    getStats: (departureId) => 
        api.get(`/activity-checkins/departures/${departureId}/stats`),

    // Luồng 2A: Điểm danh lẻ
    checkInGuest: (checkinId, location = null) => 
        api.patch(`/activity-checkins/checkins/${checkinId}/check-in`, { location }),

    // Luồng 2B: Điểm danh hàng loạt
    bulkCheckIn: (departureId, activityId, guestIds) => 
        api.post(`/activity-checkins/departures/${departureId}/activities/${activityId}/bulk-checkin`, { guestIds }),

    // Luồng 3A: Vắng mặt có phép
    markExcused: (checkinId, reason) => 
        api.patch(`/activity-checkins/checkins/${checkinId}/excuse`, { excuse_reason: reason }),
};

export default checkinService;