#!/usr/bin/env bash
# run-batch.sh — crash-safe overnight orchestrator.
# Processes sites ONE AT A TIME. Each site is isolated: a failure or a token/time
# cutoff in the middle never corrupts finished work. Resumable: re-running skips
# anything already marked done in state.tsv.
#
# Usage: bash run-batch.sh sites-batch1.txt
set -uo pipefail
cd "$(dirname "$0")"

LIST="${1:-sites-batch1.txt}"
STATE="state.tsv"            # slug<TAB>status<TAB>timestamp
LOG="run.log"
touch "$STATE"

log(){ echo "[$(date '+%H:%M:%S')] $*" | tee -a "$LOG"; }

is_done(){ grep -qP "^$1\tDONE\t" "$STATE"; }
mark(){ # slug status
  # remove any prior line for this slug, then append fresh
  grep -vP "^$1\t" "$STATE" > "$STATE.tmp" 2>/dev/null || true
  mv "$STATE.tmp" "$STATE"
  printf '%s\t%s\t%s\n' "$1" "$2" "$(date -Iseconds)" >> "$STATE"
}

log "=== batch start: $LIST ==="
while IFS='|' read -r slug url; do
  [[ -z "${slug:-}" || "$slug" == \#* ]] && continue
  slug="$(echo "$slug" | xargs)"; url="$(echo "$url" | xargs)"
  [[ -z "$url" ]] && continue

  if is_done "$slug"; then log "skip $slug (already DONE)"; continue; fi

  mark "$slug" "RUNNING"
  log ">>> $slug : $url"

  # ---- extract (own process, hard timeout, isolated) ----
  if timeout 150 node extract.js "$slug" "$url" >>"$LOG" 2>&1; then
    log "  extract ok"
  else
    log "  extract FAILED (continuing to build with whatever we got)"
  fi

  # ---- build (works off whatever tokens exist; tolerant) ----
  if [[ -f "companies/$slug/tokens.json" ]]; then
    if timeout 60 node build.js "$slug" >>"$LOG" 2>&1; then log "  build ok"; else log "  build FAILED"; fi
    # ---- screenshot the clone for verification ----
    timeout 60 node shot_clone.js "$slug" >>"$LOG" 2>&1 && log "  clone shot ok" || log "  clone shot skipped"
    mark "$slug" "DONE"
    log "<<< $slug DONE"
  else
    mark "$slug" "NO_TOKENS"
    log "<<< $slug produced no tokens, marked NO_TOKENS, moving on"
  fi

  sleep 2
done < "$LIST"

log "=== batch complete ==="
echo "" >> "$LOG"
# summary
echo "SUMMARY:" | tee -a "$LOG"
awk -F'\t' '{c[$2]++} END{for(s in c) printf "  %s: %d\n", s, c[s]}' "$STATE" | tee -a "$LOG"
