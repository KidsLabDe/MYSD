#!/usr/bin/env sh
# Copies the current plan to src/data/history/<first-date>_<school>.json so a
# new Hackday can replace src/data/hackday.json. Safe to run twice.
set -eu
cd "$(git rev-parse --show-toplevel)"

CURRENT=src/data/hackday.json
HISTORY=src/data/history

NAME=$(node -e '
  const data = JSON.parse(require("fs").readFileSync(process.argv[1], "utf8"));
  const first = [...(data.days ?? [])].map((d) => d.date).sort()[0] ?? "ohne-datum";
  const school = String(data.title ?? "hackday").split("·").pop();
  const slug = school.trim().toLowerCase()
    .replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "hackday";
  process.stdout.write(`${first}_${slug}.json`);
' "$CURRENT")

mkdir -p "$HISTORY"
TARGET="$HISTORY/$NAME"
if [ -e "$TARGET" ]; then
  if cmp -s "$CURRENT" "$TARGET"; then
    echo "Bereits archiviert: $TARGET"
    exit 0
  fi
  TARGET="$HISTORY/${NAME%.json}_$(date +%Y%m%d-%H%M%S).json"
fi
cp "$CURRENT" "$TARGET"
echo "Archiviert: $TARGET"
