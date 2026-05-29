#!/bin/bash
# ============================================================
# KEMET SOCIAL — One-Command Startup Script
# Usage: bash start.sh [web|mobile|test|all]
# ============================================================

GREEN='\033[0;32m'
GOLD='\033[0;33m'
RED='\033[0;31m'
RESET='\033[0m'
BOLD='\033[1m'

echo ""
echo -e "${GOLD}${BOLD}  🔺 KEMET SOCIAL — Startup Script${RESET}"
echo -e "${GOLD}  ══════════════════════════════════${RESET}"
echo ""

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DB_DIR="$SCRIPT_DIR/database"
WEB_DIR="$SCRIPT_DIR/web"
MOBILE_DIR="$SCRIPT_DIR/mobile"
MODE="${1:-all}"

# ── Check Python ──────────────────────────────────────────
check_python() {
  if ! command -v python3 &>/dev/null; then
    echo -e "${RED}  ❌ Python 3 not found. Install from https://python.org${RESET}"
    exit 1
  fi
  echo -e "${GREEN}  ✅ Python $(python3 --version)${RESET}"
}

# ── Check Node ────────────────────────────────────────────
check_node() {
  if ! command -v node &>/dev/null; then
    echo -e "${RED}  ❌ Node.js not found. Install from https://nodejs.org${RESET}"
    return 1
  fi
  echo -e "${GREEN}  ✅ Node $(node --version)${RESET}"
  return 0
}

# ── Install Python deps ───────────────────────────────────
install_python_deps() {
  echo -e "\n${GOLD}  📦 Installing Python dependencies...${RESET}"
  pip3 install flask flask-cors --quiet --break-system-packages 2>/dev/null || \
  pip3 install flask flask-cors --quiet
  echo -e "${GREEN}  ✅ Flask + Flask-CORS ready${RESET}"
}

# ── Init Database ─────────────────────────────────────────
init_database() {
  echo -e "\n${GOLD}  🗄️  Initializing database...${RESET}"
  cd "$DB_DIR"
  python3 -c "
import sys; sys.path.insert(0,'.')
from db import init_db, seed_data
import os
first_run = not os.path.exists('kemet.db')
conn = init_db()
if first_run:
    seed_data(conn)
    print('  ✅ Database created and seeded')
else:
    print('  ✅ Database already exists — skipping seed')
conn.close()
"
  cd "$SCRIPT_DIR"
}

# ── Run Tests ─────────────────────────────────────────────
run_tests() {
  echo -e "\n${GOLD}  🧪 Running integration tests...${RESET}"
  cd "$SCRIPT_DIR"
  python3 test_integration.py
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}  🔺 All tests passed!${RESET}"
  else
    echo -e "${RED}  ❌ Some tests failed. Check output above.${RESET}"
    exit 1
  fi
}

# ── Start API Server ──────────────────────────────────────
start_api() {
  echo -e "\n${GOLD}  🚀 Starting API server on port 5000...${RESET}"
  cd "$WEB_DIR"
  PYTHONPATH="$DB_DIR:$PYTHONPATH" python3 api.py &
  API_PID=$!
  echo $API_PID > /tmp/kemet_api.pid
  sleep 1
  if kill -0 $API_PID 2>/dev/null; then
    echo -e "${GREEN}  ✅ API running → http://localhost:5000/api/health (PID: $API_PID)${RESET}"
  else
    echo -e "${RED}  ❌ API failed to start${RESET}"
    exit 1
  fi
  cd "$SCRIPT_DIR"
}

# ── Start Web ─────────────────────────────────────────────
start_web() {
  echo -e "\n${GOLD}  🌐 Starting web app on port 3000...${RESET}"
  cd "$WEB_DIR"
  if [ ! -d "node_modules" ]; then
    echo -e "  📦 Installing npm packages..."
    npm install --silent
  fi
  npm run start &
  WEB_PID=$!
  echo $WEB_PID > /tmp/kemet_web.pid
  echo -e "${GREEN}  ✅ Web app → http://localhost:3000 (PID: $WEB_PID)${RESET}"
  cd "$SCRIPT_DIR"
}

# ── Start Mobile ──────────────────────────────────────────
start_mobile() {
  echo -e "\n${GOLD}  📱 Starting Expo mobile app...${RESET}"
  cd "$MOBILE_DIR"
  if ! command -v expo &>/dev/null; then
    echo -e "  📦 Installing Expo CLI..."
    npm install -g expo-cli --silent 2>/dev/null
  fi
  if [ ! -d "node_modules" ]; then
    echo -e "  📦 Installing mobile packages..."
    npm install --silent
  fi
  npx expo start --no-dev &
  MOB_PID=$!
  echo $MOB_PID > /tmp/kemet_mobile.pid
  echo -e "${GREEN}  ✅ Mobile app → Scan QR with Expo Go (PID: $MOB_PID)${RESET}"
  cd "$SCRIPT_DIR"
}

# ── Stop All ──────────────────────────────────────────────
stop_all() {
  echo -e "\n${GOLD}  🛑 Stopping all services...${RESET}"
  for pidfile in /tmp/kemet_api.pid /tmp/kemet_web.pid /tmp/kemet_mobile.pid; do
    if [ -f "$pidfile" ]; then
      PID=$(cat "$pidfile")
      kill $PID 2>/dev/null && echo -e "  Stopped PID $PID"
      rm -f "$pidfile"
    fi
  done
}

# ── Main ──────────────────────────────────────────────────
trap stop_all EXIT INT TERM

case "$MODE" in
  test)
    check_python
    install_python_deps
    init_database
    run_tests
    ;;
  api)
    check_python
    install_python_deps
    init_database
    start_api
    echo -e "\n${GOLD}  Press Ctrl+C to stop${RESET}\n"
    wait
    ;;
  web)
    check_python
    check_node
    install_python_deps
    init_database
    start_api
    start_web
    echo -e "\n${GOLD}  Press Ctrl+C to stop all services${RESET}"
    echo -e "${GOLD}  🌐 Web:  http://localhost:3000${RESET}"
    echo -e "${GOLD}  🔌 API:  http://localhost:5000/api${RESET}\n"
    wait
    ;;
  mobile)
    check_python
    check_node
    install_python_deps
    init_database
    start_api
    start_mobile
    echo -e "\n${GOLD}  Press Ctrl+C to stop all services${RESET}\n"
    wait
    ;;
  all|*)
    check_python
    check_node && HAS_NODE=1 || HAS_NODE=0
    install_python_deps
    init_database
    run_tests
    start_api
    [ "$HAS_NODE" = "1" ] && start_web
    echo ""
    echo -e "${GOLD}${BOLD}  ══════════════════════════════════${RESET}"
    echo -e "${GOLD}${BOLD}  🔺 KEMET SOCIAL IS RUNNING!${RESET}"
    echo -e "${GOLD}  ══════════════════════════════════${RESET}"
    echo -e "${GREEN}  🌐 Website:  http://localhost:3000${RESET}"
    echo -e "${GREEN}  🔌 API:      http://localhost:5000/api/health${RESET}"
    echo -e "${GREEN}  🗄️  DB:       database/kemet.db${RESET}"
    echo -e "${GOLD}  ══════════════════════════════════${RESET}"
    echo -e "${GOLD}  📱 Mobile: cd mobile && npx expo start${RESET}"
    echo -e "${GOLD}  🔺 Press Ctrl+C to stop all services${RESET}"
    echo ""
    wait
    ;;
esac
