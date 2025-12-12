import dayjs from 'dayjs';
import 'dayjs/locale/vi'; // Import ngôn ngữ tiếng Việt
import customParseFormat from 'dayjs/plugin/customParseFormat';
import relativeTime from 'dayjs/plugin/relativeTime';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';

// 1. Kích hoạt các Plugin hữu ích
// - customParseFormat: Hỗ trợ parse chuỗi ngày tháng theo định dạng tùy chỉnh
dayjs.extend(customParseFormat);
// - relativeTime: Hỗ trợ hiển thị thời gian tương đối (vd: "2 ngày trước")
dayjs.extend(relativeTime);
// - isSameOrBefore/After: Hỗ trợ so sánh ngày tháng tiện lợi
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);

// 2. Thiết lập ngôn ngữ mặc định là Tiếng Việt
dayjs.locale('vi');

export default dayjs;