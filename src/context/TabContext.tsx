'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { MenuItem, TabItem } from '@/types/erp';

export const DASHBOARD_TAB_ID = 'dashboard';

const INITIAL_DASHBOARD_TAB: TabItem = {
  id: DASHBOARD_TAB_ID,
  title: '대시보드',
  menuId: 'dashboard',
  categoryId: 'home',
  categoryName: '홈',
  isClosable: false,
  openedAt: Date.now(),
};

interface TabContextType {
  tabs: TabItem[];
  activeTabId: string;
  activeTab: TabItem;
  openTab: (menu: MenuItem) => void;
  closeTab: (tabId: string) => void;
  closeAllTabs: () => void;
  setActiveTabId: (tabId: string) => void;
}

const TabContext = createContext<TabContextType | undefined>(undefined);

export const TabProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [tabs, setTabs] = useState<TabItem[]>([INITIAL_DASHBOARD_TAB]);
  const [activeTabId, setActiveTabId] = useState<string>(DASHBOARD_TAB_ID);

  const openTab = useCallback((menu: MenuItem) => {
    setTabs((prevTabs) => {
      const existingTab = prevTabs.find((t) => t.menuId === menu.id);
      if (existingTab) {
        setActiveTabId(existingTab.id);
        return prevTabs;
      }

      const newTab: TabItem = {
        id: `tab-${menu.id}`,
        title: menu.title,
        menuId: menu.id,
        categoryId: menu.categoryId,
        categoryName: menu.categoryName,
        isClosable: true,
        openedAt: Date.now(),
      };

      setActiveTabId(newTab.id);
      return [...prevTabs, newTab];
    });
  }, []);

  const closeTab = useCallback((tabId: string) => {
    setTabs((prevTabs) => {
      const targetTab = prevTabs.find((t) => t.id === tabId);
      if (!targetTab || !targetTab.isClosable) {
        return prevTabs;
      }

      const newTabs = prevTabs.filter((t) => t.id !== tabId);

      // If active tab was closed, switch to adjacent tab
      if (tabId === activeTabId) {
        const closedIndex = prevTabs.findIndex((t) => t.id === tabId);
        const nextActiveTab = newTabs[closedIndex] || newTabs[closedIndex - 1] || INITIAL_DASHBOARD_TAB;
        setActiveTabId(nextActiveTab.id);
      }

      return newTabs;
    });
  }, [activeTabId]);

  const closeAllTabs = useCallback(() => {
    setTabs([INITIAL_DASHBOARD_TAB]);
    setActiveTabId(DASHBOARD_TAB_ID);
  }, []);

  const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0] || INITIAL_DASHBOARD_TAB;

  return (
    <TabContext.Provider
      value={{
        tabs,
        activeTabId,
        activeTab,
        openTab,
        closeTab,
        closeAllTabs,
        setActiveTabId,
      }}
    >
      {children}
    </TabContext.Provider>
  );
};

export const useTabs = () => {
  const context = useContext(TabContext);
  if (!context) {
    throw new Error('useTabs must be used within a TabProvider');
  }
  return context;
};

