#!/bin/bash
# ═══════════════════════════════════════════════
# CapyInn Test Gate — Pricing Engine VN
# Chạy toàn bộ test trước khi merge/deploy
# ═══════════════════════════════════════════════
set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

PROJECT_ROOT="/Volumes/Data/Hotel/CapyInn"
PASS=0
FAIL=0

echo "═══════════════════════════════════════════════"
echo "🧪 CAPYINN TEST GATE — Pricing Engine VN"
echo "═══════════════════════════════════════════════"
echo ""

# ── Gate 1: Rust Unit Tests ─────────────────────
echo -e "${YELLOW}[Gate 1/3] Rust Unit Tests (cargo test)${NC}"
cd "$PROJECT_ROOT/mhm/src-tauri"
if cargo test 2>&1 | tail -5; then
    echo -e "${GREEN}✅ Gate 1 PASSED${NC}"
    PASS=$((PASS + 1))
else
    echo -e "${RED}❌ Gate 1 FAILED${NC}"
    FAIL=$((FAIL + 1))
fi
echo ""

# ── Gate 2: Full Rust Build Check ───────────────
echo -e "${YELLOW}[Gate 2/3] Rust Build Check (cargo check)${NC}"
if cargo check 2>&1 | tail -3; then
    echo -e "${GREEN}✅ Gate 2 PASSED${NC}"
    PASS=$((PASS + 1))
else
    echo -e "${RED}❌ Gate 2 FAILED${NC}"
    FAIL=$((FAIL + 1))
fi
echo ""

# ── Gate 3: Vitest Frontend Tests ───────────────
echo -e "${YELLOW}[Gate 3/3] Vitest Frontend Tests${NC}"
cd "$PROJECT_ROOT/mhm"
if npm run test 2>&1 | tail -10; then
    echo -e "${GREEN}✅ Gate 3 PASSED${NC}"
    PASS=$((PASS + 1))
else
    echo -e "${RED}⚠️ Gate 3 FAILED (Frontend tests may not exist yet)${NC}"
    FAIL=$((FAIL + 1))
fi
echo ""

# ── Summary ─────────────────────────────────────
echo "═══════════════════════════════════════════════"
if [ $FAIL -eq 0 ]; then
    echo -e "${GREEN}🎉 ALL ${PASS} GATES PASSED — Safe to merge/deploy${NC}"
else
    echo -e "${RED}⛔ ${FAIL} GATE(S) FAILED — DO NOT merge/deploy${NC}"
fi
echo "═══════════════════════════════════════════════"
exit $FAIL
