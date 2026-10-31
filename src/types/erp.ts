export interface MenuItem {
  id: string;
  title: string;
  categoryId: string;
  categoryName: string;
  badge?: string;
  description?: string;
  icon?: string;
}

export interface MenuCategory {
  id: string;
  title: string;
  items: MenuItem[];
}

export interface TabItem {
  id: string;
  title: string;
  menuId: string;
  categoryId: string;
  categoryName: string;
  isClosable: boolean;
  openedAt: number;
}

export interface GridColumn {
  key: string;
  label: string;
  width?: string;
  align?: 'left' | 'center' | 'right';
  format?: 'text' | 'number' | 'currency' | 'date' | 'badge';
}

export interface ChartDataPoint {
  day: string;
  value: number;
}

