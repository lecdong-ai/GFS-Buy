import json
import sqlite3
import re

db_path = '/Users/bunker/GFS-ERP/prisma/gfs-erp.db'
json_path = '/Users/bunker/GFS-ERP/scratch_excel_parsed.json'

with open(json_path, 'r', encoding='utf-8') as f:
    items = json.load(f)

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

print("Connected to SQLite DB.")

# 1. Map sheets to warehouse names
warehouse_map = {
    '부자재': '부재료보관고',
    '냉장1': '냉장창고1',
    '냉장2': '냉장창고2',
    '냉동': '냉동보관고',
    '상온': '상온보관고',
}

# 2. Extract & Upsert Partners
partner_set = set()
for it in items:
    s = it.get('supplier')
    if s:
        s_clean = s.strip().replace('\n', ' ')
        partner_set.add(s_clean)

print(f"Total Unique Partners to upsert: {len(partner_set)}")

partner_id_map = {}
p_idx = 1
for p_name in sorted(list(partner_set)):
    p_id = f"V{str(p_idx).padStart(4, '0')}" if hasattr(str, 'padStart') else f"V{p_idx:04d}"
    cursor.execute("SELECT id FROM Partner WHERE name = ?", (p_name,))
    row = cursor.fetchone()
    if row:
        partner_id_map[p_name] = row[0]
    else:
        cursor.execute("""
            INSERT INTO Partner (id, name, partnerType, isUsed, createdAt, updatedAt)
            VALUES (?, ?, 'P', 1, datetime('now'), datetime('now'))
        """, (p_id, p_name))
        partner_id_map[p_name] = p_id
        p_idx += 1

print(f"Partners upserted.")

# 3. Upsert Products & Inventory
added_products = 0
updated_products = 0
added_inventories = 0

auto_pcode_idx = 1000

for it in items:
    raw_code = it.get('itemCode')
    name = it.get('itemName', '').strip()
    if not name:
        continue

    # Clean supplier
    supplier_raw = it.get('supplier', '').strip().replace('\n', ' ')
    partner_id = partner_id_map.get(supplier_raw)

    sheet = it.get('sheet')
    warehouse = warehouse_map.get(sheet, '상온보관고')
    category = '부자재' if sheet == '부자재' else '원재료'

    # Product Code
    if raw_code and str(raw_code).isdigit() and len(str(raw_code)) >= 4:
        p_code = str(raw_code).strip()
    else:
        p_code = f"MAT-{sheet[:2]}-{auto_pcode_idx}"
        auto_pcode_idx += 1

    # Numeric conversions
    try:
        box_unit = int(float(it.get('boxUnitQty') or 1))
    except:
        box_unit = 1

    try:
        unit_price = float(it.get('unitPrice') or 0)
    except:
        unit_price = 0.0

    try:
        current_qty = float(it.get('currentStock') or 0)
    except:
        current_qty = 0.0

    try:
        amount = float(it.get('amount') or 0)
    except:
        amount = current_qty * unit_price

    try:
        daily_usage = float(it.get('dailyUsageBox') or 0)
    except:
        daily_usage = 0.0

    lead_time_str = it.get('leadTime') or 'D+2'
    m = re.search(r'\d+', lead_time_str)
    lead_time_days = int(m.group(0)) if m else 2

    # Safety stock = 일일사용량(봉) * 조달기간 * 1.5 (안전계수)
    safety_stock = round(daily_usage * box_unit * lead_time_days * 1.2, 1)

    # Check if product exists by productCode or name
    cursor.execute("SELECT id FROM Product WHERE productCode = ? OR name = ?", (p_code, name))
    prod_row = cursor.fetchone()

    if prod_row:
        prod_id = prod_row[0]
        cursor.execute("""
            UPDATE Product 
            SET partnerId = COALESCE(?, partnerId),
                warehouse = ?,
                boxQty = ?,
                safetyStockQty = CASE WHEN ? > 0 THEN ? ELSE safetyStockQty END,
                updatedAt = datetime('now')
            WHERE id = ?
        """, (partner_id, warehouse, box_unit, safety_stock, safety_stock, prod_id))
        updated_products += 1
    else:
        cursor.execute("""
            INSERT INTO Product (productCode, name, spec, unit, category, kind, shift, boxQty, partnerId, warehouse, safetyStockQty, isUsed, createdAt, updatedAt)
            VALUES (?, ?, '', '봉', ?, '', '1편', ?, ?, ?, ?, 1, datetime('now'), datetime('now'))
        """, (p_code, name, category, box_unit, partner_id, warehouse, safety_stock))
        prod_id = cursor.lastrowid
        added_products += 1

    # Product Price
    if unit_price > 0:
        cursor.execute("""
            INSERT INTO ProductPrice (productId, deliveryPrice, purchasePrice, logisticsRate, effectiveDate, createdAt, updatedAt)
            VALUES (?, 0, ?, 0, '2026-10-29', datetime('now'), datetime('now'))
        """, (prod_id, unit_price))

    # Inventory Record (10월 29일 실사 기준)
    lot_no = f"LOT-20261029-{p_code}"
    expiry_date = it.get('expiryDate') or '2026-11-30'
    if not isinstance(expiry_date, str) or len(expiry_date) < 5:
        expiry_date = '2026-11-30'

    cursor.execute("SELECT id FROM Inventory WHERE productId = ? AND warehouse = ?", (prod_id, warehouse))
    inv_row = cursor.fetchone()

    if inv_row:
        cursor.execute("""
            UPDATE Inventory
            SET currentQty = ?,
                unitPrice = ?,
                stockAmount = ?,
                lastInDate = '2026-10-29',
                updatedAt = datetime('now')
            WHERE id = ?
        """, (current_qty, unit_price, amount, inv_row[0]))
    else:
        cursor.execute("""
            INSERT INTO Inventory (productId, productCode, productName, category, lotNo, expiryDate, warehouse, currentQty, unit, unitPrice, stockAmount, lastInDate, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, '봉', ?, ?, '2026-10-29', datetime('now'), datetime('now'))
        """, (prod_id, p_code, name, category, lot_no, expiry_date, warehouse, current_qty, unit_price, amount))
        added_inventories += 1

conn.commit()
conn.close()

print(f"Seeding completed successfully!")
print(f"Products added: {added_products}, updated: {updated_products}")
print(f"Inventories created/updated: {len(items)}")

