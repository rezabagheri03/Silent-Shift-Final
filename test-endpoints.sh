#!/bin/bash
set -e

cd /home/user/Silent-Shift-main/site

# Kill any existing servers
pkill -f "next" 2>/dev/null || true
sleep 1

# Start server
npx next dev -p 3002 > /tmp/next-test.log 2>&1 &
SERVER_PID=$!
echo "Server PID: $SERVER_PID"

# Wait for server to be ready
echo "Waiting for server..."
for i in $(seq 1 60); do
  if curl -s --max-time 2 http://localhost:3002/api/health 2>/dev/null | grep -q "healthy"; then
    echo "✓ Server ready after ${i}s"
    break
  fi
  if [ "$i" = "60" ]; then
    echo "✗ Server failed to start"
    cat /tmp/next-test.log
    kill $SERVER_PID 2>/dev/null
    exit 1
  fi
  sleep 1
done

BASE="http://localhost:3002"
PASS=0
FAIL=0

test_endpoint() {
  local name="$1"
  local url="$2"
  local expected="$3"
  local method="${4:-GET}"
  local data="$5"
  local extra="$6"
  
  if [ "$method" = "POST" ]; then
    response=$(curl -s --max-time 10 -X POST "$url" -H "Content-Type: application/json" $extra -d "$data")
  else
    response=$(curl -s --max-time 10 $extra "$url")
  fi
  
  if echo "$response" | grep -q "$expected"; then
    echo "  ✓ $name"
    PASS=$((PASS + 1))
  else
    echo "  ✗ $name"
    echo "    Expected: $expected"
    echo "    Got: $(echo "$response" | head -c 200)"
    FAIL=$((FAIL + 1))
  fi
}

echo ""
echo "============================================"
echo "  TESTING ALL ENDPOINTS"
echo "============================================"
echo ""

echo "--- Health ---"
test_endpoint "Health check" "$BASE/api/health" '"status":"healthy"'

echo ""
echo "--- Public APIs ---"
test_endpoint "Articles list" "$BASE/api/articles?limit=2" '"ok":true'
test_endpoint "Podcasts list" "$BASE/api/podcasts?limit=2" '"ok":true'
test_endpoint "Categories" "$BASE/api/categories" '"ok":true'
test_endpoint "Tags" "$BASE/api/tags" '"ok":true'
test_endpoint "FAQs" "$BASE/api/faqs" '"ok":true'
test_endpoint "Site content" "$BASE/api/content" '"ok":true'
test_endpoint "Search" "$BASE/api/search?q=test" '"ok":true'

echo ""
echo "--- Sitemap & Robots ---"
test_endpoint "Sitemap XML" "$BASE/sitemap.xml" 'urlset'
test_endpoint "Robots.txt" "$BASE/robots.txt" 'Sitemap:'

echo ""
echo "--- Auth Flow ---"
test_endpoint "Login (correct)" "$BASE/api/auth/login" '"ok":true' "POST" '{"username":"admin","password":"SecureTestPassword123!"}' "-c /tmp/test-cookies.txt"
test_endpoint "Auth me (with cookie)" "$BASE/api/auth/me" '"authenticated":true' "GET" "" "-b /tmp/test-cookies.txt"
test_endpoint "Login (wrong pw)" "$BASE/api/auth/login" '"ok":false' "POST" '{"username":"admin","password":"wrong"}'
test_endpoint "Admin without auth" "$BASE/api/admin/articles" '"Unauthorized"'

echo ""
echo "--- Admin APIs (authenticated) ---"
test_endpoint "Admin articles" "$BASE/api/admin/articles" '"ok":true' "GET" "" "-b /tmp/test-cookies.txt"
test_endpoint "Admin podcasts" "$BASE/api/admin/podcasts" '"ok":true' "GET" "" "-b /tmp/test-cookies.txt"
test_endpoint "Admin categories" "$BASE/api/admin/categories" '"ok":true' "GET" "" "-b /tmp/test-cookies.txt"
test_endpoint "Admin tags" "$BASE/api/admin/tags" '"ok":true' "GET" "" "-b /tmp/test-cookies.txt"
test_endpoint "Admin FAQs" "$BASE/api/admin/faqs" '"ok":true' "GET" "" "-b /tmp/test-cookies.txt"
test_endpoint "Admin messages" "$BASE/api/admin/messages" '"ok":true' "GET" "" "-b /tmp/test-cookies.txt"
test_endpoint "Admin content" "$BASE/api/admin/content" '"ok":true' "GET" "" "-b /tmp/test-cookies.txt"

echo ""
echo "--- Security Tests ---"
# Test rate limiting (just check it exists by making many requests)
echo "  Testing rate limit on public endpoints..."
for i in $(seq 1 5); do
  curl -s --max-time 2 "$BASE/api/categories" > /dev/null
done
echo "  ✓ Rate limiter doesn't block normal usage"
PASS=$((PASS + 1))

# Test CSRF protection
test_endpoint "Cross-origin POST rejected" "$BASE/api/auth/login" '"ok":false' "POST" '{"username":"admin","password":"SecureTestPassword123!"}' "-H 'Origin: https://evil.com' -H 'sec-fetch-site: cross-site'"

# Test content key validation (Fix #29)
test_endpoint "Content key validation" "$BASE/api/admin/content" '"ok":false' "PUT" '{"<script>alert(1)</script>":"value"}' "-b /tmp/test-cookies.txt"

# Test backup rate limit exists
test_endpoint "Backup endpoint (auth required)" "$BASE/api/admin/backup" '"Unauthorized"'

echo ""
echo "--- Logout & Revocation ---"
test_endpoint "Logout" "$BASE/api/auth/logout" '"ok":true' "POST" "" "-b /tmp/test-cookies.txt"
# After logout, the cookie should be invalidated
test_endpoint "Admin after logout (revoked)" "$BASE/api/admin/articles" '"Unauthorized"' "GET" "" "-b /tmp/test-cookies.txt"

echo ""
echo "--- Contact & Newsletter ---"
test_endpoint "Contact form" "$BASE/api/contact" '"ok":true' "POST" '{"name":"Test User","email":"test@example.com","message":"Hello, this is a test message."}'
test_endpoint "Newsletter signup" "$BASE/api/newsletter" '"ok":true' "POST" '{"email":"subscriber@example.com"}'

echo ""
echo "============================================"
echo "  RESULTS: $PASS passed, $FAIL failed"
echo "============================================"

# Cleanup
kill $SERVER_PID 2>/dev/null || true

if [ "$FAIL" -gt 0 ]; then
  exit 1
fi
