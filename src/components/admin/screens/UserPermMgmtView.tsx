'use client';

import React, { useState, useMemo } from 'react';
import { AdminActionBar } from '../common/AdminActionBar';
import { useAdmin } from '../context/AdminContext';
import { Copy, ShieldCheck, UserCheck, Search, CheckSquare } from 'lucide-react';

import { useInlineEdit } from '@/components/common/EditableCell';
import { EditableTableWrapper } from '@/components/common/EditableTableWrapper';
export const UserPermMgmtView: React.FC = () => {
  const {
    users,
    selectedPermUserId,
    setSelectedPermUserId,
    userPermMap,
    updateUserPerm,
    toggleAllRead,
    toggleAllWrite,
    copyUserPerm,
  } = useAdmin();

  const [userKeyword, setUserKeyword] = useState('');
  const [pageKeyword, setPageKeyword] = useState('');
  const [isCopyModalOpen, setIsCopyModalOpen] = useState(false);
  const [copySourceUserId, setCopySourceUserId] = useState('admin');

  // Currently selected user object
  const activeUser = useMemo(() => {
    return users.find((u) => u.userId === selectedPermUserId) || users[0];
  }, [users, selectedPermUserId]);

  // Current user's permission items
  const currentPerms = useMemo(() => {
    return userPermMap[activeUser.userId] || [];
  }, [userPermMap, activeUser.userId]);

  // Filtered pages
  const filteredPerms = useMemo(() => {
    if (!pageKeyword.trim()) return currentPerms;
    const kw = pageKeyword.trim().toLowerCase();
    return currentPerms.filter(
      (p) => p.pageName.toLowerCase().includes(kw) || p.pageCode.toLowerCase().includes(kw)
    );
  }, [currentPerms, pageKeyword]);

  // Filtered users
  const filteredUsers = useMemo(() => {
    if (!userKeyword.trim()) return users;
    const kw = userKeyword.trim().toLowerCase();
    return users.filter(
      (u) => u.userId.toLowerCase().includes(kw) || u.userName.toLowerCase().includes(kw)
    );
  }, [users, userKeyword]);

  // Check state of "조회전체" and "저장전체"
  const isAllRead = useMemo(() => {
    return currentPerms.length > 0 && currentPerms.every((p) => p.canRead);
  }, [currentPerms]);

  const isAllWrite = useMemo(() => {
    return currentPerms.length > 0 && currentPerms.every((p) => p.canWrite);
  }, [currentPerms]);

  // ── 인라인 편집 ──
  const { editingCell, editValue, setEditValue, startEditing, cancelEditing, isEditing } = useInlineEdit();
  const saveEdit = (rowId: string | number, colKey: string, rows: any[], setRows: (r: any[]) => void) => {
    setRows(rows.map(r => {
      const id = r.id ?? r.no ?? r.idx ?? r.index;
      if (id === rowId) {
        const numVal = Number(editValue);
        return { ...r, [colKey]: isNaN(numVal) || editValue.trim() === '' ? editValue : numVal };
      }
      return r;
    }));
    cancelEditing();
  };

  const handleExecuteCopy = () => {
    if (copySourceUserId === activeUser.userId) {
      alert('동일한 사용자 간에는 복사할 수 없습니다.');
      return;
    }
    const success = copyUserPerm(copySourceUserId, activeUser.userId);
    if (success) {
      alert(`[${copySourceUserId}] 사용자의 권한이 [${activeUser.userId}] 사용자에게 일괄 복사되었습니다.`);
    }
    setIsCopyModalOpen(false);
  };

  const handleSave = () => {
    alert(`사용자 [${activeUser.userId} : ${activeUser.userName}]의 메뉴 접근 권한이 성공적으로 저장되었습니다.`);
  };

  const handleReset = () => {
    setUserKeyword('');
    setPageKeyword('');
    alert('사용자 권한 관리 화면이 새로고침되었습니다.');
  };

  return (
    <div className="flex flex-col h-full bg-[#f0f2f5] text-[12.5px] select-none">
      {/* 1. Header Action Bar */}
      <AdminActionBar
        title="사용자권한"
        buttons={[
          { key: 'search', label: '조회', icon: 'search', onClick: () => {} },
          { key: 'save', label: '저장', icon: 'save', onClick: handleSave },
          { key: 'reset', label: '초기화', icon: 'reset', onClick: handleReset },
          {
            key: 'copy',
            label: '복사',
            icon: 'copy',
            onClick: () => setIsCopyModalOpen(true),
          },
        ]}
        helpContent="사용자별 ERP 메뉴 및 기능에 대한 읽기(조회) 및 쓰기(저장/수정/삭제) 권한을 매트릭스로 제어합니다. 상단 [조회전체], [저장전체] 체크박스로 일괄 설정할 수 있으며, [복사] 버튼으로 다른 사용자의 권한을 즉시 복제할 수 있습니다."
      />

      {/* 2. Main 45:55 Horizontal Split Layout */}
      <div className="flex-1 p-2 bg-[#d8dde5] overflow-hidden flex flex-row gap-2">
        {/* Left: 사용자 목록 (45% width) */}
        <div className="w-[45%] bg-white border border-[#9aa2ad] shadow-sm flex flex-col overflow-hidden">
          {/* Header Bar */}
          <div className="bg-[#dde3ea] px-3 py-1.5 border-b border-[#b8c1cc] flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-bold text-gray-800 text-[12.5px]">
              <UserCheck className="w-4 h-4 text-blue-700" />
              <span>사용자 목록</span>
            </div>
            <div className="relative">
              <input
                type="text"
                placeholder="ID/이름 검색"
                value={userKeyword}
                onChange={(e) => setUserKeyword(e.target.value)}
                className="bg-white border border-gray-400 rounded px-2 py-0.5 text-[11px] w-36 focus:outline-none focus:border-blue-600"
              />
              <Search className="w-3 h-3 text-gray-400 absolute right-1.5 top-1.5 pointer-events-none" />
            </div>
          </div>

          {/* User Grid */}
          <div className="flex-1 overflow-auto">
            <EditableTableWrapper><table className="w-full min-w-full border-collapse text-[12.5px]">
              <thead className="whitespace-nowrap sticky top-0 bg-[#c0c7ea] text-gray-900 border-b border-[#9aa2ad] z-10 shadow-sm">
                <tr className="h-[27px]">
                  <th className="w-12 border-r border-[#a0a8be] text-center font-bold">순번</th>
                  <th className="w-32 border-r border-[#a0a8be] text-center font-bold">사용자id</th>
                  <th className="w-36 border-r border-[#a0a8be] text-center font-bold">사용자이름</th>
                  <th className="border-r border-[#a0a8be] text-center font-bold">권한레벨</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u, idx) => {
                  const isSelected = u.userId === activeUser.userId;
                  return (
                    <tr
                      key={u.id}
                      onClick={() => setSelectedPermUserId(u.userId)}
                      className={`border-b border-gray-200 transition-colors h-[27px] cursor-pointer ${
                        isSelected
                          ? 'bg-blue-100 font-bold text-blue-900'
                          : 'bg-white hover:bg-blue-50/50'
                      }`}
                    >
                      <td className="cursor-pointer hover:bg-blue-50/80 hover:outline hover:outline-1 hover:outline-blue-400 text-center bg-[#f2f2f2] border-r border-gray-300 font-semibold text-gray-600">
                        {idx + 1}
                      </td>
                      <td className="cursor-pointer hover:bg-blue-50/80 hover:outline hover:outline-1 hover:outline-blue-400 px-3 border-r border-gray-300 font-bold">{u.userId}</td>
                      <td className="cursor-pointer hover:bg-blue-50/80 hover:outline hover:outline-1 hover:outline-blue-400 px-3 border-r border-gray-300 font-medium">{u.userName}</td>
                      <td className="cursor-pointer hover:bg-blue-50/80 hover:outline hover:outline-1 hover:outline-blue-400 px-3 text-center text-purple-900">{u.levelName}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table></EditableTableWrapper>
          </div>
        </div>

        {/* Right: 메뉴권한 매트릭스 (55% width) */}
        <div className="flex-1 bg-white border border-[#9aa2ad] shadow-sm flex flex-col overflow-hidden">
          {/* Header Bar */}
          <div className="bg-[#dde3ea] px-3 py-1.5 border-b border-[#b8c1cc] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span className="font-bold text-gray-800 text-[12.5px]">
                메뉴권한 - [{activeUser.userId} : {activeUser.userName}]
              </span>
            </div>

            {/* Checkbox Group: 조회전체, 저장전체 */}
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-1.5 font-bold text-gray-800 cursor-pointer bg-white px-2 py-0.5 rounded border border-gray-300">
                <input
                  type="checkbox"
                  checked={isAllRead}
                  onChange={(e) => toggleAllRead(activeUser.userId, e.target.checked)}
                  className="rounded border-gray-400 text-blue-600 focus:ring-0 cursor-pointer"
                />
                <span>조회전체</span>
              </label>

              <label className="flex items-center gap-1.5 font-bold text-gray-800 cursor-pointer bg-white px-2 py-0.5 rounded border border-gray-300">
                <input
                  type="checkbox"
                  checked={isAllWrite}
                  onChange={(e) => toggleAllWrite(activeUser.userId, e.target.checked)}
                  className="rounded border-gray-400 text-emerald-600 focus:ring-0 cursor-pointer"
                />
                <span>저장전체</span>
              </label>

              <div className="relative ml-1">
                <input
                  type="text"
                  placeholder="메뉴/페이지명 검색"
                  value={pageKeyword}
                  onChange={(e) => setPageKeyword(e.target.value)}
                  className="bg-white border border-gray-400 rounded px-2 py-0.5 text-[11px] w-36 focus:outline-none focus:border-blue-600"
                />
                <Search className="w-3 h-3 text-gray-400 absolute right-1.5 top-1.5 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Permission Matrix Grid */}
          <div className="flex-1 overflow-auto">
            <EditableTableWrapper><table className="w-full min-w-full border-collapse text-[12.5px]">
              <thead className="whitespace-nowrap sticky top-0 bg-[#c0c7ea] text-gray-900 border-b border-[#9aa2ad] z-10 shadow-sm">
                <tr className="h-[27px]">
                  <th className="w-12 border-r border-[#a0a8be] text-center font-bold">순번</th>
                  <th className="w-48 border-r border-[#a0a8be] text-center font-bold">
                    페이지코드
                  </th>
                  <th className="border-r border-[#a0a8be] text-center font-bold">페이지명</th>
                  <th className="w-24 border-r border-[#a0a8be] text-center font-bold">읽기</th>
                  <th className="w-24 border-r border-[#a0a8be] text-center font-bold">쓰기</th>
                </tr>
              </thead>
              <tbody>
                {filteredPerms.map((perm, index) => (
                  <tr
                    key={perm.pageCode}
                    className="border-b border-gray-200 hover:bg-blue-50/50 transition-colors h-[27px]"
                  >
                    <td className="cursor-pointer hover:bg-blue-50/80 hover:outline hover:outline-1 hover:outline-blue-400 text-center bg-[#f2f2f2] border-r border-gray-300 font-semibold text-gray-600">
                      {index + 1}
                    </td>
                    <td className="cursor-pointer hover:bg-blue-50/80 hover:outline hover:outline-1 hover:outline-blue-400 px-3 border-r border-gray-300 font-mono text-[11px] text-gray-700">
                      {perm.pageCode}
                    </td>
                    <td className="cursor-pointer hover:bg-blue-50/80 hover:outline hover:outline-1 hover:outline-blue-400 px-3 border-r border-gray-300 font-medium text-gray-900">
                      {perm.pageName}
                    </td>
                    {/* 읽기 체크박스 */}
                    <td className="cursor-pointer hover:bg-blue-50/80 hover:outline hover:outline-1 hover:outline-blue-400 text-center border-r border-gray-300">
                      <input
                        type="checkbox"
                        checked={perm.canRead}
                        onChange={(e) =>
                          updateUserPerm(
                            activeUser.userId,
                            perm.pageCode,
                            'canRead',
                            e.target.checked
                          )
                        }
                        className="rounded border-gray-400 text-blue-600 focus:ring-0 cursor-pointer"
                      />
                    </td>
                    {/* 쓰기 체크박스 */}
                    <td className="cursor-pointer hover:bg-blue-50/80 hover:outline hover:outline-1 hover:outline-blue-400 text-center border-r border-gray-300">
                      <input
                        type="checkbox"
                        checked={perm.canWrite}
                        onChange={(e) =>
                          updateUserPerm(
                            activeUser.userId,
                            perm.pageCode,
                            'canWrite',
                            e.target.checked
                          )
                        }
                        className="rounded border-gray-400 text-emerald-600 focus:ring-0 cursor-pointer"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table></EditableTableWrapper>
          </div>
        </div>
      </div>

      {/* 3. Bottom Status Bar: LblInfo */}
      <div className="bg-[#e4e8ee] border-t border-[#b0b8c2] px-3 py-1 flex items-center justify-between text-[11px] text-gray-700 select-none">
        <div className="flex items-center gap-1.5">
          <span className="font-bold text-blue-800">LblInfo:</span>
          <span>
            [사용자ID: <b>{activeUser.userId}</b>, 이름: <b>{activeUser.userName}</b>, 레벨:{' '}
            <b>{activeUser.levelName}</b>] 총 {currentPerms.length}개 메뉴 권한 로드 완료
          </span>
        </div>
        <span className="text-gray-500 font-mono">Security Governance Engine Active</span>
      </div>

      {/* 4. 권한 복사 모달 */}
      {isCopyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-md shadow-2xl border border-gray-400 w-[420px] text-gray-800 text-[12.5px] overflow-hidden">
            <div className="bg-[#333333] text-white px-3 py-2 flex items-center justify-between font-bold">
              <div className="flex items-center gap-1.5">
                <Copy className="w-4 h-4 text-yellow-300" />
                <span>사용자 권한 복사</span>
              </div>
              <button
                onClick={() => setIsCopyModalOpen(false)}
                className="text-gray-300 hover:text-white font-bold text-sm px-1"
              >
                ✕
              </button>
            </div>
            <div className="p-4 flex flex-col gap-3 bg-[#fbfbfb]">
              <p className="text-gray-700 leading-normal">
                기준 사용자의 메뉴 권한(읽기/쓰기)을 대상 사용자에게 일괄 복사합니다.
              </p>
              <div className="flex items-center justify-between bg-gray-100 p-2.5 rounded border border-gray-300">
                <span className="font-semibold text-gray-700">복사 원본 사용자:</span>
                <select
                  value={copySourceUserId}
                  onChange={(e) => setCopySourceUserId(e.target.value)}
                  className="bg-white border border-gray-400 rounded px-2 py-1 text-[12.5px] font-semibold"
                >
                  {users
                    .filter((u) => u.userId !== activeUser.userId)
                    .map((u) => (
                      <option key={u.userId} value={u.userId}>
                        [{u.userId}] {u.userName} ({u.levelName})
                      </option>
                    ))}
                </select>
              </div>
              <div className="flex items-center justify-between bg-blue-50 p-2.5 rounded border border-blue-200">
                <span className="font-semibold text-blue-900">적용 대상 사용자:</span>
                <span className="font-bold text-blue-800">
                  [{activeUser.userId}] {activeUser.userName}
                </span>
              </div>
            </div>
            <div className="bg-[#f0f0f0] border-t border-gray-300 px-3 py-2 flex justify-end gap-2">
              <button
                onClick={handleExecuteCopy}
                className="px-4 py-1.5 bg-[#4a72a8] hover:bg-[#3d5e8c] text-white font-bold rounded text-[11px]"
              >
                권한 복사 실행
              </button>
              <button
                onClick={() => setIsCopyModalOpen(false)}
                className="px-4 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded text-[11px]"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

