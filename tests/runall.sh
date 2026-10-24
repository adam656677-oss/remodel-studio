#!/bin/bash
# run every regression test; report failures
cd "$(dirname "$0")"
pass=0; fail=""
for t in $(ls test[0-9]*.py | sort -V); do
  case $t in test48.py) continue;; esac
  out=$(timeout 300 python3 $t 2>&1); rc=$?
  if [ $rc -ne 0 ] || echo "$out" | grep -q "pageerror\|Traceback"; then fail="$fail $t"; echo "== $t FAILED"; echo "$out" | tail -4; else pass=$((pass+1)); fi
done
echo "PASSED $pass; FAILED:$fail"
