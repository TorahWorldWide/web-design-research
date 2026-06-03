#!/usr/bin/env bash
# snap-batch.sh — faithful-snapshot every site, crash-safe & resumable.
# Detects bot-block / access-denied pages and flags them instead of pretending success.
set -uo pipefail
cd "$(dirname "$0")"
LIST="${1:-all-sites.txt}"
STATE="snap-state.tsv"
LOG="snap.log"
touch "$STATE"
log(){ echo "[$(date '+%H:%M:%S')] $*" | tee -a "$LOG"; }
is_done(){ grep -qP "^$1\t(DONE|BLOCKED)\t" "$STATE"; }
mark(){ grep -vP "^$1\t" "$STATE" > "$STATE.tmp" 2>/dev/null || true; mv "$STATE.tmp" "$STATE"; printf '%s\t%s\t%s\n' "$1" "$2" "$(date -Iseconds)" >> "$STATE"; }

log "=== snapshot batch start: $LIST ==="
while IFS='|' read -r slug url; do
  [[ -z "${slug:-}" || "$slug" == \#* ]] && continue
  slug="$(echo "$slug"|xargs)"; url="$(echo "$url"|xargs)"; [[ -z "$url" ]] && continue
  if is_done "$slug"; then log "skip $slug"; continue; fi
  mark "$slug" "RUNNING"; log ">>> $slug"
  if timeout 160 node snapshot.js "$slug" "$url" >>"$LOG" 2>&1; then
    f="companies/$slug/snapshot.html"
    if [[ -f "$f" ]] && grep -qiE "Access Denied|Pardon Our Interruption|unusual traffic|Just a moment|Attention Required|enable JavaScript and cookies|Request unsuccessful|bot detection|errors.edgesuite" "$f"; then
      mark "$slug" "BLOCKED"; log "<<< $slug BLOCKED (bot protection)"
    elif [[ -f "$f" && $(wc -c < "$f") -gt 20000 ]]; then
      mark "$slug" "DONE"; log "<<< $slug DONE"
    else
      mark "$slug" "THIN"; log "<<< $slug THIN (small/empty, check)"
    fi
  else
    mark "$slug" "FAILED"; log "<<< $slug FAILED"
  fi
  sleep 2
done < "$LIST"
log "=== snapshot batch complete ==="
awk -F'\t' '{c[$2]++} END{print "SUMMARY:"; for(s in c) printf "  %s: %d\n", s, c[s]}' "$STATE" | tee -a "$LOG"
