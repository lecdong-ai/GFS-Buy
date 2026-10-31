/*
 * GFS ↔ ERP 브릿지 (public/gfs 전용, 원본 /Users/bunker/GFS untouched)
 * - 부모(ERP)에서 postMessage로 수주/실사 데이터를 받아 GFS state에 주입 후 재계산
 * - GFS 원본 파일(app.js) 수정 없이 동작하는 additive 레이어
 */
(function () {
  'use strict';

  function normName(s) {
    return String(s == null ? '' : s).replace(/\s+/g, '');
  }

  function safeGet(fn, fallback) {
    try {
      const v = fn();
      return v === undefined ? fallback : v;
    } catch (e) {
      return fallback;
    }
  }

  function sendBack(source, origin, payload) {
    try {
      source.postMessage(payload, origin);
    } catch (e) { /* ignore */ }
  }

  function applyOrders(items, source, origin) {
    if (typeof state === 'undefined' || !state) {
      sendBack(source, origin, { type: 'GFS_ORDERS_APPLIED', success: false, error: 'GFS state 없음 (발주서 먼저 로드 필요)' });
      return;
    }
    const orders = [];
    let total = 0;
    (items || []).forEach(function (it) {
      const name = String((it && it.menuName) || '').trim();
      const qty = Number((it && it.qty) || 0) || 0;
      if (!name || !(qty > 0)) return;
      orders.push({ menuName: name, orderQty: qty });
      total += qty;
    });
    state.vegetableOrders = orders;
    state.vegetableOrdersMap = {};
    state.totalFinishedGoodsQty = total;
    orders.forEach(function (o) {
      state.vegetableOrdersMap[normName(o.menuName)] = o.orderQty;
    });
    state.ordersFileName = 'ERP연동';
    try {
      if (typeof applyFinishedGoodsOrdersToMaterials === 'function') applyFinishedGoodsOrdersToMaterials();
      if (typeof renderVegetableOrdersBanner === 'function') renderVegetableOrdersBanner();
      if (typeof recalculateAll === 'function') recalculateAll();
      if (typeof updateDockIntelligence === 'function') updateDockIntelligence();
    } catch (e) {
      sendBack(source, origin, { type: 'GFS_ORDERS_APPLIED', success: false, error: String((e && e.message) || e) });
      return;
    }
    const related = safeGet(function () {
      return (state.rawItems || []).filter(function (m) { return m.isRelatedToOrders; }).length;
    }, -1);
    sendBack(source, origin, { type: 'GFS_ORDERS_APPLIED', success: true, count: orders.length, totalQty: total, relatedItems: related });
  }

  function cleanOf(fnName, v) {
    return safeGet(function () {
      if (typeof window[fnName] !== 'function') return '';
      return window[fnName](v) || '';
    }, '');
  }

  function applyAudit(items, source, origin) {
    if (typeof state === 'undefined' || !state) {
      sendBack(source, origin, { type: 'GFS_AUDIT_APPLIED', success: false, error: 'GFS state 없음 (발주서 먼저 로드 필요)' });
      return;
    }
    if (typeof applyInventoryAuditToRawItems !== 'function') {
      sendBack(source, origin, { type: 'GFS_AUDIT_APPLIED', success: false, error: '감사 반영 함수 없음' });
      return;
    }
    const auditMap = {};
    (items || []).forEach(function (it) {
      const name = String((it && (it.name || it.productName)) || '').trim();
      if (!name) return;
      const rec = {
        id: it.id != null ? String(it.id) : '',
        name: name,
        cleanName: cleanOf('cleanAuditItemName', name),
        cleanFull: cleanOf('cleanFull', name),
        cleanPure: cleanOf('cleanPure', name),
        cleanCore: cleanOf('cleanCore', name),
        box: Number(it.box) || 0,
        piece: Number(it.piece) || 0,
        currentStock: Number(it.currentStock) || 0,
        packQty: Number(it.packQty) || 1,
        unitPrice: Number(it.unitPrice) || 0,
        sheet: it.sheet || it.warehouse || '',
        rowIndex: -1,
      };
      auditMap['name_' + name] = rec;
      if (rec.cleanFull) auditMap['cf_' + rec.cleanFull] = rec;
      if (rec.cleanPure) auditMap['cp_' + rec.cleanPure] = rec;
      if (rec.cleanCore) auditMap['cc_' + rec.cleanCore] = rec;
      if (rec.cleanName) auditMap['ca_' + rec.cleanName] = rec;
    });
    let res = { matchedCount: 0, discrepancyCount: 0 };
    try {
      res = applyInventoryAuditToRawItems(auditMap, 'ERP연동') || res;
      if (typeof recalculateAll === 'function') recalculateAll();
    } catch (e) {
      sendBack(source, origin, { type: 'GFS_AUDIT_APPLIED', success: false, error: String((e && e.message) || e) });
      return;
    }
    sendBack(source, origin, { type: 'GFS_AUDIT_APPLIED', success: true, matched: res.matchedCount || 0, discrepancy: res.discrepancyCount || 0 });
  }

  window.addEventListener('message', function (e) {
    try {
      if (e.origin !== window.location.origin) return;
      const msg = e.data || {};
      if (!msg || typeof msg.type !== 'string') return;
      if (msg.type === 'GFS_ORDERS') applyOrders(msg.items, e.source, e.origin);
      else if (msg.type === 'GFS_AUDIT') applyAudit(msg.items, e.source, e.origin);
      else if (msg.type === 'GFS_PING') sendBack(e.source, e.origin, { type: 'GFS_PONG', bridge: 1 });
    } catch (err) { /* ignore */ }
  });

  window.GFS_BRIDGE = { version: 1 };
})();
