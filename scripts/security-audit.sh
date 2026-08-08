#!/bin/bash

echo "🔒 Running Web Security & Package Audit..."

# 1. Secret & Key Scan Audit
FORBIDDEN_PATTERNS="eyJhbGci|sbp_[a-zA-Z0-9]{20,}|SUPABASE_SERVICE_ROLE_KEY=[a-zA-Z0-9]|BEGIN PRIVATE KEY|sk_live_[a-zA-Z0-9]{20,}|AKIA[0-9A-Z]{16}"
LEAKS=$(grep -r -E -n "$FORBIDDEN_PATTERNS" src/ 2>/dev/null | grep -v '\.example' || true)
if [ -n "$LEAKS" ]; then
    echo "❌ SECURITY AUDIT FAILED: Hardcoded secret/key leak detected:"
    echo "$LEAKS"
    exit 1
fi

# 2. Dynamic Execution & XSS Security Audit
DANGEROUS_EVAL=$(grep -r -n -E 'eval\(|new Function\(' src/ 2>/dev/null || true)
if [ -n "$DANGEROUS_EVAL" ]; then
    echo "❌ SECURITY AUDIT FAILED: Dynamic code execution (eval / new Function) found:"
    echo "$DANGEROUS_EVAL"
    exit 1
fi
DANGEROUS_XSS=$(grep -r -n -E 'dangerouslySetInnerHTML' src/ 2>/dev/null | grep -v 'ExpandableHtml' | grep -v 'ViewEpisodeModal' | grep -v 'EpisodeRow' | grep -v 'SlateEditorExamples' || true)
if [ -n "$DANGEROUS_XSS" ]; then
    echo "⚠️ SECURITY AUDIT WARNING: Unsanitized HTML rendering found outside approved widget components:"
    echo "$DANGEROUS_XSS"
    exit 1
fi

# 3. Unpinned Wildcard Package Audit
UNPINNED_PKGS=$(grep -n '"\*"' package.json 2>/dev/null || true)
if [ -n "$UNPINNED_PKGS" ]; then
    echo "⚠️ PACKAGE AUDIT WARNING: Unpinned wildcard package dependency '*' found in package.json:"
    echo "$UNPINNED_PKGS"
    exit 1
fi

echo "✅ Web Security & Package Audit Passed Cleanly!"
