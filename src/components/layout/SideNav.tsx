'use client';

import React, { useState, useMemo } from 'react';
import { MENU_CATEGORIES } from '@/config/menuConfig';
import { useTabs } from '@/context/TabContext';
import { MenuItem } from '@/types/erp';
import {
  Search,
  ChevronDown,
  ChevronRight,
  Folder,
  FolderOpen,
  FileText,
  X,
  Layers,
  Sparkles,
} from 'lucide-react';

interface SideNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SideNav: React.FC<SideNavProps> = ({ isOpen, onClose }) => {
  const { openTab, activeTab } = useTabs();
  const [searchTerm, setSearchTerm] = useState('');
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({
    work: true,
    sales: true,
    purchase: true,
    production: true,
    inventory: true,
    management: true,
    master: true,
    cost: true,
    help: false,
    admin: false,
  });

  const toggleCategory = (id: string) => {
    setOpenCategories((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const expandAll = () => {
    const next: Record<string, boolean> = {};
    MENU_CATEGORIES.forEach((c) => (next[c.id] = true));
    setOpenCategories(next);
  };

  const collapseAll = () => {
    const next: Record<string, boolean> = {};
    MENU_CATEGORIES.forEach((c) => (next[c.id] = false));
    setOpenCategories(next);
  };

  // Filter categories and items based on search term
  const filteredCategories = useMemo(() => {
    if (!searchTerm.trim()) return MENU_CATEGORIES;

    const term = searchTerm.toLowerCase();
    return MENU_CATEGORIES.map((category) => {
      const matchingItems = category.items.filter((item) =>
        item.title.toLowerCase().includes(term)
      );
      return {
        ...category,
        items: matchingItems,
      };
    }).filter((category) => category.items.length > 0);
  }, [searchTerm]);

  if (!isOpen) return null;

  return (
    <aside className="w-[290px] h-full bg-[#f8fafc] border-r border-gray-300 flex flex-col shrink-0 select-none text-xs z-30 shadow-md">
      {/* Sidebar Header */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-[#e2e8f0] border-b border-gray-300">
        <div className="flex items-center gap-2 font-black text-gray-800 text-[13.5px]">
          <Layers className="w-4 h-4 text-blue-700" />
          <span>전체 메뉴 탐색기</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onClose}
            className="p-1 hover:bg-gray-300 text-gray-600 rounded cursor-pointer"
            title="사이드바 닫기"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Quick Search */}
      <div className="p-2.5 border-b border-gray-200 bg-white">
        <div className="relative">
          <input
            type="text"
            placeholder="메뉴명 검색 (예: GSR, BOM, 발주)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-2.5 py-1 text-[12.5px] border border-gray-300 rounded-xs bg-white focus:outline-none focus:border-blue-600 placeholder:text-gray-400 h-8 shadow-2xs"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-2.5 top-2" />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-2 text-gray-400 hover:text-gray-700 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <div className="flex items-center justify-between mt-1.5 text-[11px] text-gray-500 font-medium">
          <span>전체 10개 대분류 67개 메뉴</span>
          <div className="flex items-center gap-1.5">
            <button onClick={expandAll} className="hover:text-blue-700 underline cursor-pointer">
              모두펼침
            </button>
            <span>/</span>
            <button onClick={collapseAll} className="hover:text-blue-700 underline cursor-pointer">
              모두접음
            </button>
          </div>
        </div>
      </div>

      {/* Menu Tree List */}
      <div className="flex-1 overflow-y-auto p-1.5 space-y-1">
        {filteredCategories.length === 0 ? (
          <div className="p-6 text-center text-gray-400 text-[13px]">
            검색 결과가 없습니다.
          </div>
        ) : (
          filteredCategories.map((category) => {
            const isCatOpen = searchTerm.trim() ? true : !!openCategories[category.id];

            return (
              <div key={category.id} className="border border-transparent">
                {/* Category Header */}
                <button
                  type="button"
                  onClick={() => toggleCategory(category.id)}
                  className="w-full flex items-center justify-between px-2.5 py-1.5 text-left text-gray-800 hover:bg-[#e2e8f0] font-bold text-[13px] group rounded-xs cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2">
                    {isCatOpen ? (
                      <ChevronDown className="w-4 h-4 text-gray-600" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-gray-600" />
                    )}
                    {isCatOpen ? (
                      <FolderOpen className="w-4 h-4 text-blue-600" />
                    ) : (
                      <Folder className="w-4 h-4 text-amber-600" />
                    )}
                    <span>{category.title}</span>
                  </div>
                  <span className="text-[11px] text-gray-500 font-mono">
                    ({category.items.length})
                  </span>
                </button>

                {/* Submenu Items */}
                {isCatOpen && (
                  <div className="pl-5 pr-1 py-1 space-y-1 border-l-2 border-gray-200 ml-4">
                    {category.items.map((item) => {
                      const isCurrent = activeTab.menuId === item.id;

                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => openTab(item)}
                          className={`w-full flex items-center justify-between px-2.5 py-1.5 text-left text-[12.5px] rounded-xs transition-colors cursor-pointer ${
                            isCurrent
                              ? 'bg-[#2563eb] text-white font-bold shadow-xs'
                              : 'text-gray-700 hover:bg-blue-50 hover:text-blue-950 font-medium'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <FileText
                              className={`w-3.5 h-3.5 shrink-0 ${
                                isCurrent ? 'text-white' : 'text-gray-400'
                              }`}
                            />
                            <span className="truncate">{item.title}</span>
                          </div>

                          {item.badge && (
                            <span
                              className={`text-[10px] px-1.5 py-0.5 rounded-xs shrink-0 border ${
                                isCurrent
                                  ? 'bg-white text-blue-900 border-white font-bold'
                                  : 'bg-blue-100 text-blue-700 border-blue-200'
                              }`}
                            >
                              {item.badge}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
};

