"""
Helper: Generate a small HTML harness that pre-sets localStorage with JWT
so chrome headless can take screenshots of protected pages.
"""
import json
import sys
import base64
import urllib.request
import urllib.parse
import time
import subprocess
import os
from pathlib import Path

BASE = "http://localhost:4174"
API = "http://localhost:8080"
OUT = Path(r"D:\metbus\BUS\screenshots")
OUT.mkdir(parents=True, exist_ok=True)

CHROME = r"C:\Program Files\Google\Chrome\Application\chrome.exe"


def http_post(url, data, headers=None):
    body = json.dumps(data).encode("utf-8")
    req = urllib.request.Request(url, data=body, method="POST")
    req.add_header("Content-Type", "application/json")
    if headers:
        for k, v in headers.items():
            req.add_header(k, v)
    with urllib.request.urlopen(req, timeout=20) as r:
        return json.loads(r.read().decode("utf-8"))


def http_get(url, headers=None):
    req = urllib.request.Request(url)
    if headers:
        for k, v in headers.items():
            req.add_header(k, v)
    with urllib.request.urlopen(req, timeout=20) as r:
        return json.loads(r.read().decode("utf-8"))


# 1) Login admin
admin_login = http_post(f"{API}/api/public/auth/login", {
    "username": "admin",
    "password": "ChangeMe@123",
})
admin_token = admin_login["token"]
print(f"[+] Admin token len={len(admin_token)}")

try:
    cust_login = http_post(f"{API}/api/public/auth/login", {
        "username": "demo",
        "password": "Demo@1234",
    })
    cust_token = cust_login["token"]
    print(f"[+] Customer (demo) token len={len(cust_token)}")
    HAS_CUST = True
    cust_user = {
        "id": cust_login["user"]["id"],
        "username": cust_login["user"]["username"],
        "email": cust_login["user"]["email"],
        "phone": cust_login["user"].get("phone", "0901234567"),
        "role": cust_login["user"]["role"],
        "status": "ACTIVE",
        "fullName": cust_login["user"].get("fullName", "Demo Customer"),
    }
except Exception as e:
    print(f"[!] Customer login failed: {e}")
    cust_token = admin_token  # fallback
    HAS_CUST = False
    cust_user = {"id": 2, "username": "customer1", "email": "x", "phone": "", "role": "CUSTOMER", "status": "ACTIVE"}


def make_harness(setup_js, target_url, out_name, wait_ms=4000):
    """Create harness HTML and tell chrome to load it. JS sets localStorage then redirects."""
    harness_html = f"""<!doctype html><html><head><meta charset='utf-8'></head>
<body><script>
{setup_js}
window.location.replace({json.dumps(target_url)});
</script></body></html>"""
    harness_path = OUT / f"_harness_{out_name}.html"
    harness_path.write_text(harness_html, encoding="utf-8")

    # Use --user-data-dir for isolation
    user_dir = OUT / f"_chrome_{out_name}"
    user_dir.mkdir(exist_ok=True)

    cmd = [
        CHROME,
        "--headless=new",
        "--disable-gpu",
        "--no-sandbox",
        "--hide-scrollbars",
        "--window-size=1440,900",
        f"--user-data-dir={user_dir}",
        f"--virtual-time-budget={wait_ms}",
        f"--screenshot={OUT/out_name}",
        f"file:///{harness_path}",
    ]
    subprocess.run(cmd, capture_output=True, timeout=60)
    return (OUT / out_name).exists()


def setup_token(token, user_obj):
    return f"""
localStorage.setItem('auth_token', {json.dumps(token)});
localStorage.setItem('user', {json.dumps(json.dumps(user_obj))});
"""


# Customer screenshots
print("[+] Capturing customer pages...")
pages = [
    ("/login", "01_login.png", 2500, None),
    ("/register", "02_register.png", 2500, None),
    ("/", "03_home.png", 3500, ("cust", cust_token)),
    ("/search", "04_search.png", 4500, ("cust", cust_token)),
    ("/my-tickets", "05_my_tickets.png", 4500, ("cust", cust_token)),
    ("/profile", "06_profile.png", 3500, ("cust", cust_token)),
    ("/payment/return?vnp_ResponseCode=00&vnp_TxnRef=DEMO", "07_payment_return.png", 4500, ("cust", cust_token)),
]

admin_user = {
    "id": 1, "username": "admin", "email": "admin@example.com",
    "phone": "0900000001", "role": "ADMIN", "status": "ACTIVE",
    "createdAt": "2026-01-01T00:00:00",
}
admin_pages = [
    ("/admin/dashboard", "08_admin_dashboard.png"),
    ("/admin/users", "09_admin_users.png"),
    ("/admin/buses", "10_admin_buses.png"),
    ("/admin/routes", "11_admin_routes.png"),
    ("/admin/trips", "12_admin_trips.png"),
    ("/admin/tickets", "13_admin_tickets.png"),
    ("/admin/assignments", "14_admin_assignments.png"),
    ("/admin/revenue", "15_admin_revenue.png"),
    ("/admin/revenue-stats", "16_admin_revenue_stats.png"),
]

for path, fname, wait, setup in pages:
    if setup is None:
        # No login needed, use clean chrome
        user_dir = OUT / f"_chrome_{fname}"
        user_dir.mkdir(exist_ok=True)
        cmd = [CHROME, "--headless=new", "--disable-gpu", "--no-sandbox",
               "--hide-scrollbars", "--window-size=1440,900",
               f"--user-data-dir={user_dir}",
               f"--virtual-time-budget={wait}",
               f"--screenshot={OUT/fname}",
               f"{BASE}{path}"]
        subprocess.run(cmd, capture_output=True, timeout=60)
    else:
        _, tok = setup
        if not HAS_CUST:
            # skip protected customer page
            print(f"   {fname}: SKIPPED (no customer login)")
            continue
        make_harness(setup_token(tok, cust_user), f"{BASE}{path}", fname, wait)
    print(f"   {fname}: {(OUT/fname).exists()}")

for path, fname in admin_pages:
    make_harness(setup_token(admin_token, admin_user), f"{BASE}{path}", fname, 5000)
    print(f"   {fname}: {(OUT/fname).exists()}")

print("[+] Done.")