import { useMemo } from 'react';
import { MENU_ITEMS } from '../components/config/sidebarConfig'; 
import { useAuth } from '../context/AuthContext'; 

export const useSidebarMenu = () => {
  const { hasPermission, loading } = useAuth();

  const filteredMenu = useMemo(() => {
    if (loading) return [];

    const filterItems = (items) => {
      return items.reduce((acc, item) => {
        if (!hasPermission(item.permissions)) {
          return acc;
        }

        if (item.children) {
          const visibleChildren = filterItems(item.children);
          if (visibleChildren.length > 0) {
            acc.push({ ...item, children: visibleChildren });
          }
        } else {
          acc.push(item);
        }

        return acc;
      }, []);
    };

    return filterItems(MENU_ITEMS);
  }, [loading, hasPermission]);

  return filteredMenu;
};