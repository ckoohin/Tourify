import { useMemo } from 'react';
import { MENU_ITEMS } from '../components/config/sidebarConfig'; 
import { useAuth } from '../context/AuthContext'; 

export const useSidebarMenu = () => {
  const { hasPermission, loading } = useAuth();

  const filteredMenu = useMemo(() => {
    if (loading) return [];

    const filterItems = (items) => {
      return items.reduce((acc, item) => {
        // 1. Kiểm tra quyền của mục cha
        if (!hasPermission(item.permissions)) {
          return acc;
        }

        // 2. Nếu có con, lọc danh sách con
        if (item.children) {
          const visibleChildren = filterItems(item.children);
          // Chỉ hiển thị mục cha nếu có ít nhất 1 mục con hiển thị
          if (visibleChildren.length > 0) {
            acc.push({ ...item, children: visibleChildren });
          }
        } else {
          // 3. Item đơn lẻ -> Hiển thị
          acc.push(item);
        }

        return acc;
      }, []);
    };

    return filterItems(MENU_ITEMS);
  }, [loading, hasPermission]);

  return filteredMenu;
};