#!/bin/bash
# =============================================================================
# (주)GFS 엔터프라이즈 ERP — SQLite DB 자동 백업 스크립트
# =============================================================================

BACKUP_DIR="prisma/backups"
DB_FILE="prisma/gfs-erp.db"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/gfs-erp_${TIMESTAMP}.db"

mkdir -p "${BACKUP_DIR}"

if [ -f "${DB_FILE}" ]; then
  # SQLite 안전 백업 (WAL 체크포인트 후 복사)
  sqlite3 "${DB_FILE}" ".backup '${BACKUP_FILE}'" 2>/dev/null || cp "${DB_FILE}" "${BACKUP_FILE}"
  echo "✅ [$(date)] DB 백업 성공: ${BACKUP_FILE} ($(du -h "${BACKUP_FILE}" | cut -f1))"

  # 30일 초과된 오래된 백업 자동 정리
  find "${BACKUP_DIR}" -name "gfs-erp_*.db" -mtime +30 -delete 2>/dev/null
else
  echo "❌ [$(date)] DB 파일을 찾을 수 없습니다: ${DB_FILE}"
  exit 1
fi

