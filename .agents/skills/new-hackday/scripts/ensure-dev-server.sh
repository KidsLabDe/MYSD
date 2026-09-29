#!/usr/bin/env sh
# Makes sure the board's dev server is running (macOS + Linux). Starts it in
# the background if needed and waits until it answers. The open browser tab
# reloads by itself once hackday.json changes.
set -eu
cd "$(git rev-parse --show-toplevel)"

PORT="${MYS_PORT:-5173}"
URL="http://localhost:$PORT/"
LOG="${TMPDIR:-/tmp}/mys-dashboard-dev.log"

answers() { curl -fsS -o /dev/null --max-time 2 "$URL" 2>/dev/null; }

if answers; then
  echo "Dev-Server läuft bereits: $URL"
  exit 0
fi

[ -d node_modules ] || npm install --no-fund --no-audit

# nohup + background: keeps running after this script (and the agent) exits.
nohup npm run dev -- --port "$PORT" --strictPort >"$LOG" 2>&1 &

i=0
while [ "$i" -lt 30 ]; do
  if answers; then
    echo "Dev-Server gestartet: $URL (Log: $LOG)"
    exit 0
  fi
  i=$((i + 1))
  sleep 1
done
echo "Dev-Server antwortet nicht – siehe $LOG" >&2
exit 1
