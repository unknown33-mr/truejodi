import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "http://localhost:8001")

def test_health_or_root():
    # Test getting profiles or root api
    response = requests.get(f"{BASE_URL}/api/profiles")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0

def test_admin_login():
    response = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": "admin@truejodi.com",
        "password": "admin123"
    })
    assert response.status_code == 200
    data = response.json()
    assert "user" in data
    assert data["user"]["email"] == "admin@truejodi.com"
    assert "access_token" in response.cookies or "access_token" in response.headers or response.cookies.get("access_token") is not None or len(response.cookies) > 0

def test_register_and_login_flow():
    unique_email = f"testuser_{os.urandom(4).hex()}@truejodi.com"
    register_payload = {
        "profileFor": "Self",
        "gender": "Male",
        "fullName": "Test Groom",
        "age": 28,
        "religion": "Hindu",
        "community": "Brahmin",
        "education": "B.Tech",
        "occupation": "Software Engineer",
        "state": "Maharashtra",
        "district": "Mumbai",
        "mobile": "9876543210",
        "email": unique_email,
        "password": "testpass123"
    }
    res = requests.post(f"{BASE_URL}/api/auth/register", json=register_payload)
    assert res.status_code == 200
    data = res.json()
    assert data["user"]["email"] == unique_email
    
    # Test login with newly registered user
    login_res = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": unique_email,
        "password": "testpass123"
    })
    assert login_res.status_code == 200
    assert login_res.json()["user"]["email"] == unique_email
