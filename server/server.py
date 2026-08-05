#!/usr/bin/env python3
import http.server
import socketserver
import json
import os
import sys
import time
import hashlib
import hmac
import base64
import uuid
import re

PORT = 5005
SERVER_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(SERVER_DIR, 'data')
UPLOADS_DIR = os.path.join(SERVER_DIR, 'uploads')

os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(UPLOADS_DIR, exist_ok=True)

USERS_FILE = os.path.join(DATA_DIR, 'users.json')
ADMINS_FILE = os.path.join(DATA_DIR, 'admins.json')
PRODUCTS_FILE = os.path.join(DATA_DIR, 'products.json')

INITIAL_PRODUCTS = [
  {
    "id": "p1",
    "sku": "AUR-BLZ-01",
    "brand": "AURA STUDIO",
    "title": "AURA Oversized Silk-Linen Co-ord Blazer",
    "category": "Women",
    "price": 149,
    "originalPrice": 249,
    "rating": 4.8,
    "reviews": 142,
    "discount": "40% OFF",
    "stock": 42,
    "status": "In Stock",
    "image": "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600",
    "tags": ["blazer", "linen", "co-ords", "women"]
  },
  {
    "id": "p2",
    "sku": "AUR-TEE-09",
    "brand": "MONOCHROME",
    "title": "Heavyweight Drop-Shoulder Tee",
    "category": "Men",
    "price": 45,
    "originalPrice": 75,
    "rating": 4.9,
    "reviews": 88,
    "discount": "40% OFF",
    "stock": 5,
    "status": "Low Stock",
    "image": "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600",
    "tags": ["tee", "oversized", "men", "streetwear"]
  },
  {
    "id": "p3",
    "sku": "AUR-TR-12",
    "brand": "KINETIC",
    "title": "Pleated Tailored Wide Trousers",
    "category": "Men",
    "price": 89,
    "originalPrice": 130,
    "rating": 4.7,
    "reviews": 54,
    "discount": "31% OFF",
    "stock": 28,
    "status": "In Stock",
    "image": "https://images.unsplash.com/photo-1584370848010-d7fe6bc767ec?w=600",
    "tags": ["pants", "trousers", "pleated", "formal"]
  },
  {
    "id": "p4",
    "sku": "AUR-ETH-04",
    "brand": "ETHNIC CRAFT",
    "title": "Handwoven Chanderi Kurta Set",
    "category": "Ethnic",
    "price": 110,
    "originalPrice": 180,
    "rating": 4.9,
    "reviews": 112,
    "discount": "38% OFF",
    "stock": 18,
    "status": "In Stock",
    "image": "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600",
    "tags": ["ethnic", "kurta", "festive"]
  },
  {
    "id": "p5",
    "sku": "AUR-JKT-07",
    "brand": "AURA URBAN",
    "title": "Minimalist Utility Bomber Jacket",
    "category": "Streetwear",
    "price": 120,
    "originalPrice": 180,
    "rating": 4.6,
    "reviews": 67,
    "discount": "33% OFF",
    "stock": 14,
    "status": "In Stock",
    "image": "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600",
    "tags": ["jacket", "bomber", "streetwear", "men"]
  },
  {
    "id": "p6",
    "sku": "AUR-DRS-03",
    "brand": "LUMEN",
    "title": "Draped Asymmetric Satin Midi Dress",
    "category": "Women",
    "price": 135,
    "originalPrice": 210,
    "rating": 4.8,
    "reviews": 95,
    "discount": "35% OFF",
    "stock": 22,
    "status": "In Stock",
    "image": "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=600",
    "tags": ["dress", "satin", "women", "party"]
  }
]

def read_json(path, default=[]):
    if not os.path.exists(path):
        write_json(path, default)
        return default
    try:
        with open(path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception:
        return default

def write_json(path, data):
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2)

def hash_password(password):
    return hashlib.sha256(password.encode('utf-8')).hexdigest()

def generate_token(user_id, role):
    payload = f"{user_id}:{role}:{time.time()}"
    return base64.urlsafe_b64encode(payload.encode('utf-8')).decode('utf-8')

# Ensure products file exists
read_json(PRODUCTS_FILE, INITIAL_PRODUCTS)

class AuraAPIHandler(http.server.BaseHTTPRequestHandler):
    def _send_cors_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')

    def do_OPTIONS(self):
        self.send_response(204)
        self._send_cors_headers()
        self.end_headers()

    def _respond_json(self, status_code, data):
        self.send_response(status_code)
        self._send_cors_headers()
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps(data).encode('utf-8'))

    def _read_body_json(self):
        length = int(self.headers.get('Content-Length', 0))
        if length == 0:
            return {}
        raw = self.rfile.read(length)
        return json.loads(raw.decode('utf-8'))

    def do_GET(self):
        path = self.path.split('?')[0]

        # Serve static uploads
        if path.startswith('/uploads/'):
            filename = os.path.basename(path)
            file_path = os.path.join(UPLOADS_DIR, filename)
            if os.path.exists(file_path):
                self.send_response(200)
                self._send_cors_headers()
                if filename.endswith('.png'):
                    self.send_header('Content-Type', 'image/png')
                elif filename.endswith('.webp'):
                    self.send_header('Content-Type', 'image/webp')
                else:
                    self.send_header('Content-Type', 'image/jpeg')
                self.end_headers()
                with open(file_path, 'rb') as f:
                    self.wfile.write(f.read())
                return
            else:
                self._respond_json(404, {"success": False, "message": "File not found"})
                return

        if path == '/api/health':
            self._respond_json(200, {"status": "ok", "message": "AURA Backend Active (Python Engine)"})
            return

        if path == '/api/products':
            products = read_json(PRODUCTS_FILE, INITIAL_PRODUCTS)
            self._respond_json(200, {"success": True, "count": len(products), "products": products})
            return

        if path == '/api/auth/me':
            token = self.headers.get('Authorization', '').replace('Bearer ', '')
            if not token:
                self._respond_json(401, {"success": False, "message": "Access denied"})
                return
            try:
                decoded = base64.urlsafe_b64decode(token.encode('utf-8')).decode('utf-8')
                user_id, role, _ = decoded.split(':', 2)
                if role == 'admin':
                    admins = read_json(ADMINS_FILE, [])
                    admin = next((a for a in admins if a['id'] == user_id), None)
                    if admin:
                        user_copy = dict(admin)
                        user_copy.pop('password', None)
                        self._respond_json(200, {"success": True, "role": "admin", "user": user_copy})
                        return
                else:
                    users = read_json(USERS_FILE, [])
                    user = next((u for u in users if u['id'] == user_id), None)
                    if user:
                        user_copy = dict(user)
                        user_copy.pop('password', None)
                        self._respond_json(200, {"success": True, "role": "user", "user": user_copy})
                        return
            except Exception:
                pass
            self._respond_json(403, {"success": False, "message": "Invalid token"})
            return

        self._respond_json(404, {"success": False, "message": "Endpoint not found"})

    def do_POST(self):
        path = self.path.split('?')[0]

        # File Upload API
        if path == '/api/upload':
            content_type = self.headers.get('Content-Type', '')
            length = int(self.headers.get('Content-Length', 0))
            raw_body = self.rfile.read(length)

            filename = f"upload_{uuid.uuid4().hex[:10]}.jpg"
            file_path = os.path.join(UPLOADS_DIR, filename)

            if 'multipart/form-data' in content_type:
                match = re.search(rb'filename="([^"]+)"', raw_body)
                if match:
                    orig_name = match.group(1).decode('utf-8', errors='ignore')
                    ext = os.path.splitext(orig_name)[1] or '.jpg'
                    filename = f"upload_{uuid.uuid4().hex[:10]}{ext}"
                    file_path = os.path.join(UPLOADS_DIR, filename)
                
                parts = raw_body.split(rb'\r\n\r\n')
                if len(parts) > 1:
                    file_data = parts[1].rsplit(rb'\r\n--', 1)[0]
                    with open(file_path, 'wb') as f:
                        f.write(file_data)
                else:
                    with open(file_path, 'wb') as f:
                        f.write(raw_body)
            else:
                with open(file_path, 'wb') as f:
                    f.write(raw_body)

            file_url = f"/uploads/{filename}"
            self._respond_json(200, {
                "success": True,
                "message": "File uploaded successfully!",
                "url": file_url,
                "fullUrl": f"http://localhost:{PORT}{file_url}"
            })
            return

        body = self._read_body_json()

        # User Signup
        if path == '/api/auth/user/signup':
            name = body.get('name')
            email = body.get('email', '').strip().lower()
            password = body.get('password')

            if not name or not email or not password:
                self._respond_json(400, {"success": False, "message": "Name, email and password required"})
                return

            users = read_json(USERS_FILE, [])
            if any(u['email'] == email for u in users):
                self._respond_json(409, {"success": False, "message": "User email already exists"})
                return

            new_user = {
                "id": f"usr_{int(time.time()*1000)}",
                "name": name,
                "email": email,
                "password": hash_password(password),
                "phone": body.get('phone', ''),
                "avatarUrl": body.get('avatarUrl') or "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300",
                "role": "user",
                "createdAt": time.strftime('%Y-%m-%dT%H:%M:%SZ')
            }
            users.append(new_user)
            write_json(USERS_FILE, users)

            token = generate_token(new_user['id'], 'user')
            user_clean = dict(new_user)
            user_clean.pop('password', None)
            self._respond_json(201, {"success": True, "token": token, "user": user_clean})
            return

        # User Login
        if path == '/api/auth/user/login':
            email = body.get('email', '').strip().lower()
            password = body.get('password')

            users = read_json(USERS_FILE, [])
            user = next((u for u in users if u['email'] == email), None)

            if not user or user['password'] != hash_password(password):
                self._respond_json(401, {"success": False, "message": "Invalid email or password"})
                return

            token = generate_token(user['id'], 'user')
            user_clean = dict(user)
            user_clean.pop('password', None)
            self._respond_json(200, {"success": True, "token": token, "user": user_clean})
            return

        # Admin Signup
        if path == '/api/auth/admin/signup':
            name = body.get('name')
            store_name = body.get('storeName')
            email = body.get('email', '').strip().lower()
            password = body.get('password')

            if not name or not store_name or not email or not password:
                self._respond_json(400, {"success": False, "message": "Name, store name, email, and password required"})
                return

            admins = read_json(ADMINS_FILE, [])
            if any(a['email'] == email for a in admins):
                self._respond_json(409, {"success": False, "message": "Admin email already exists"})
                return

            store_id = f"store_aur{uuid.uuid4().hex[:5]}"
            new_admin = {
                "id": f"adm_{int(time.time()*1000)}",
                "storeId": store_id,
                "name": name,
                "storeName": store_name,
                "email": email,
                "password": hash_password(password),
                "phone": body.get('phone', ''),
                "avatarUrl": body.get('avatarUrl') or "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300",
                "role": "admin",
                "createdAt": time.strftime('%Y-%m-%dT%H:%M:%SZ')
            }
            admins.append(new_admin)
            write_json(ADMINS_FILE, admins)

            token = generate_token(new_admin['id'], 'admin')
            admin_clean = dict(new_admin)
            admin_clean.pop('password', None)
            self._respond_json(201, {"success": True, "token": token, "admin": admin_clean})
            return

        # Admin Login
        if path == '/api/auth/admin/login':
            email = body.get('email', '').strip().lower()
            password = body.get('password')

            admins = read_json(ADMINS_FILE, [])
            admin = next((a for a in admins if a['email'] == email), None)

            if not admin or admin['password'] != hash_password(password):
                self._respond_json(401, {"success": False, "message": "Invalid merchant credentials"})
                return

            token = generate_token(admin['id'], 'admin')
            admin_clean = dict(admin)
            admin_clean.pop('password', None)
            self._respond_json(200, {"success": True, "token": token, "admin": admin_clean})
            return

        # Create Product
        if path == '/api/products':
            title = body.get('title')
            price = body.get('price')
            category = body.get('category')

            if not title or not price or not category:
                self._respond_json(400, {"success": False, "message": "Title, price, category required"})
                return

            num_price = float(price)
            num_orig = float(body.get('originalPrice', num_price * 1.4))
            products = read_json(PRODUCTS_FILE, INITIAL_PRODUCTS)

            new_prod = {
                "id": f"p_{int(time.time()*1000)}",
                "sku": f"AUR-{uuid.uuid4().hex[:4].upper()}",
                "brand": body.get('brand', 'AURA STUDIO'),
                "title": title,
                "category": category,
                "price": num_price,
                "originalPrice": int(num_orig),
                "rating": 5.0,
                "reviews": 1,
                "discount": "NEW",
                "stock": int(body.get('stock', 10)),
                "status": "In Stock",
                "image": body.get('image') or "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600",
                "tags": [category.lower()]
            }
            products.insert(0, new_prod)
            write_json(PRODUCTS_FILE, products)
            self._respond_json(201, {"success": True, "message": "Product created", "product": new_prod})
            return

        self._respond_json(404, {"success": False, "message": "Endpoint not found"})

    def do_PUT(self):
        path = self.path.split('?')[0]
        if path == '/api/auth/profile':
            token = self.headers.get('Authorization', '').replace('Bearer ', '')
            if not token:
                self._respond_json(401, {"success": False, "message": "Access denied"})
                return
            body = self._read_body_json()
            try:
                decoded = base64.urlsafe_b64decode(token.encode('utf-8')).decode('utf-8')
                user_id, role, _ = decoded.split(':', 2)

                if role == 'admin':
                    admins = read_json(ADMINS_FILE, [])
                    for a in admins:
                        if a['id'] == user_id:
                            if 'name' in body and body['name']: a['name'] = body['name']
                            if 'phone' in body: a['phone'] = body['phone']
                            if 'avatarUrl' in body and body['avatarUrl']: a['avatarUrl'] = body['avatarUrl']
                            if 'storeName' in body and body['storeName']: a['storeName'] = body['storeName']
                            write_json(ADMINS_FILE, admins)
                            a_clean = dict(a)
                            a_clean.pop('password', None)
                            self._respond_json(200, {"success": True, "admin": a_clean})
                            return
                else:
                    users = read_json(USERS_FILE, [])
                    for u in users:
                        if u['id'] == user_id:
                            if 'name' in body and body['name']: u['name'] = body['name']
                            if 'phone' in body: u['phone'] = body['phone']
                            if 'avatarUrl' in body and body['avatarUrl']: u['avatarUrl'] = body['avatarUrl']
                            write_json(USERS_FILE, users)
                            u_clean = dict(u)
                            u_clean.pop('password', None)
                            self._respond_json(200, {"success": True, "user": u_clean})
                            return
            except Exception as e:
                print("Profile update error:", e)
            self._respond_json(400, {"success": False, "message": "Failed to update profile"})
            return

        self._respond_json(404, {"success": False, "message": "Endpoint not found"})

if __name__ == '__main__':
    server = socketserver.TCPServer(('', PORT), AuraAPIHandler)
    print(f"🚀 AURA Backend Server running on http://localhost:{PORT}")
    print(f"📁 Persistent database store ready in {DATA_DIR}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        server.server_close()
