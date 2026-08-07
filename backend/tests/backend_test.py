"""Backend regression tests for Truejodi Matrimony Phase-2.
Covers: auth (login/me), profile update, completion %, photo CRUD,
recommendations, search filters, privacy, block/unblock, delete account.
"""
import io
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "http://localhost:8001").rstrip("/")

PRIMARY_EMAIL = "testuser@truejodi.com"
PRIMARY_PASSWORD = "testpass123"

SAMPLE_EMAIL = "priya.sharma@truejodi.com"
SAMPLE_PASSWORD = "Password@123"


# ---------- fixtures ----------
@pytest.fixture(scope="module")
def primary_token():
    r = requests.post(f"{BASE_URL}/api/auth/login", json={"email": PRIMARY_EMAIL, "password": PRIMARY_PASSWORD})
    assert r.status_code == 200, r.text
    body = r.json()
    assert "access_token" in body and body["access_token"]
    assert body["user"]["email"] == PRIMARY_EMAIL
    # partnerPreferences and privacySettings should exist
    assert "partnerPreferences" in body["user"]
    assert "privacySettings" in body["user"]
    return body["access_token"]


@pytest.fixture(scope="module")
def primary_headers(primary_token):
    return {"Authorization": f"Bearer {primary_token}"}


@pytest.fixture(scope="module")
def sample_token():
    r = requests.post(f"{BASE_URL}/api/auth/login", json={"email": SAMPLE_EMAIL, "password": SAMPLE_PASSWORD})
    if r.status_code != 200:
        pytest.skip("Sample user not seeded")
    return r.json()["access_token"]


# ---------- auth ----------
class TestAuth:
    def test_login_returns_token_and_user(self):
        r = requests.post(f"{BASE_URL}/api/auth/login", json={"email": PRIMARY_EMAIL, "password": PRIMARY_PASSWORD})
        assert r.status_code == 200
        d = r.json()
        assert d["user"]["email"] == PRIMARY_EMAIL
        assert isinstance(d["access_token"], str) and len(d["access_token"]) > 20

    def test_login_bad_password(self):
        r = requests.post(f"{BASE_URL}/api/auth/login", json={"email": PRIMARY_EMAIL, "password": "wrongpass"})
        assert r.status_code == 400

    def test_me_requires_auth(self):
        r = requests.get(f"{BASE_URL}/api/auth/me")
        assert r.status_code == 401

    def test_me_with_bearer(self, primary_headers):
        r = requests.get(f"{BASE_URL}/api/auth/me", headers=primary_headers)
        assert r.status_code == 200
        d = r.json()
        assert d["email"] == PRIMARY_EMAIL
        assert "photos" in d
        assert "partnerPreferences" in d
        assert "privacySettings" in d


# ---------- profile update + completion ----------
class TestProfile:
    def test_update_profile_whitelisted_fields(self, primary_headers):
        payload = {
            "fullName": "Test User Updated",
            "aboutMe": "Loves testing.",
            "diet": "Vegetarian",
            "smoking": "No",
            "drinking": "No",
            "languages": ["Hindi", "English"],
            "hobbies": ["Reading"],
            "height": "5 ft 5 in",
            "maritalStatus": "Never Married",
            "motherTongue": "Hindi",
            "education": "B.Tech",
            "occupation": "Software Engineer",
            "state": "Maharashtra",
            "district": "Mumbai",
            "annualIncome": "10 LPA",
            "manglik": "No",
            "horoscope": "Available",
            "partnerPreferences": {"ageFrom": 26, "ageTo": 32, "religion": "Hindu"},
            "privacySettings": {"hideMobile": True, "hideEmail": True, "hideWhatsapp": True, "profileVisibility": "Public"},
            "shouldBeIgnored": "xxx",  # not in whitelist
        }
        r = requests.put(f"{BASE_URL}/api/users/profile", json=payload, headers=primary_headers)
        assert r.status_code == 200, r.text
        u = r.json()["user"]
        assert u["fullName"] == "Test User Updated"
        assert u["aboutMe"] == "Loves testing."
        assert u["diet"] == "Vegetarian"
        assert "shouldBeIgnored" not in u

    def test_completion_returns_percentage(self, primary_headers):
        r = requests.get(f"{BASE_URL}/api/users/completion", headers=primary_headers)
        assert r.status_code == 200
        v = r.json()["completion"]
        assert isinstance(v, int) and 0 <= v <= 100
        # After the big update above, completion should be non-trivial
        assert v > 30


# ---------- photos ----------
def _png_bytes():
    # 1x1 red PNG
    return (
        b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x02\x00\x00\x00\x90wS"
        b"\xde\x00\x00\x00\x0cIDATx\x9cc\xf8\xcf\xc0\x00\x00\x00\x03\x00\x01;\x9d\r\x93\x00\x00\x00\x00IEND\xaeB`\x82"
    )


class TestPhotos:
    photo_ids = []

    def test_upload_first_photo(self, primary_headers):
        files = {"file": ("t1.png", io.BytesIO(_png_bytes()), "image/png")}
        r = requests.post(f"{BASE_URL}/api/users/photos", headers=primary_headers, files=files)
        if r.status_code == 503:
            pytest.skip("Object storage unavailable")
        assert r.status_code == 200, r.text
        d = r.json()
        assert isinstance(d["photos"], list) and len(d["photos"]) >= 1
        TestPhotos.photo_ids = [p["id"] for p in d["photos"]]

    def test_upload_more_and_max_limit(self, primary_headers):
        # Fill up to 3
        r_me = requests.get(f"{BASE_URL}/api/auth/me", headers=primary_headers).json()
        existing = len(r_me.get("photos") or [])
        for i in range(3 - existing):
            files = {"file": (f"t{i}.png", io.BytesIO(_png_bytes()), "image/png")}
            r = requests.post(f"{BASE_URL}/api/users/photos", headers=primary_headers, files=files)
            if r.status_code == 503:
                pytest.skip("Object storage unavailable")
            assert r.status_code == 200, r.text
        # 4th should 400
        files = {"file": ("t4.png", io.BytesIO(_png_bytes()), "image/png")}
        r = requests.post(f"{BASE_URL}/api/users/photos", headers=primary_headers, files=files)
        assert r.status_code == 400
        TestPhotos.photo_ids = [p["id"] for p in r.json().get("photos", [])] if r.json().get("photos") else \
            [p["id"] for p in requests.get(f"{BASE_URL}/api/auth/me", headers=primary_headers).json()["photos"]]

    def test_set_primary_and_delete(self, primary_headers):
        me = requests.get(f"{BASE_URL}/api/auth/me", headers=primary_headers).json()
        photos = me.get("photos") or []
        if len(photos) < 2:
            pytest.skip("Not enough photos")
        second_id = photos[1]["id"]
        r = requests.post(f"{BASE_URL}/api/users/photos/{second_id}/primary", headers=primary_headers)
        assert r.status_code == 200
        new_photos = r.json()["photos"]
        assert any(p["id"] == second_id and p["is_primary"] for p in new_photos)
        assert sum(1 for p in new_photos if p["is_primary"]) == 1

        # Delete primary and verify next becomes primary
        r = requests.delete(f"{BASE_URL}/api/users/photos/{second_id}", headers=primary_headers)
        assert r.status_code == 200
        after = r.json()["photos"]
        assert all(p["id"] != second_id for p in after)
        if after:
            assert any(p["is_primary"] for p in after)


# ---------- recommendations ----------
class TestRecommendations:
    def test_recommendations_returns_opposite_gender_scored(self, primary_headers):
        r = requests.get(f"{BASE_URL}/api/recommendations?limit=8", headers=primary_headers)
        assert r.status_code == 200
        recs = r.json()["recommendations"]
        assert isinstance(recs, list)
        assert len(recs) > 0, "Expected sample candidates seeded"
        # primary user is Female, expect Male candidates
        genders = {c.get("gender") for c in recs}
        assert genders.issubset({"Male"}), f"Unexpected genders: {genders}"
        for c in recs:
            assert "compatibility" in c and 0 <= c["compatibility"] <= 100
            assert "fullName" in c
        # Sorted descending
        scores = [c["compatibility"] for c in recs]
        assert scores == sorted(scores, reverse=True)


# ---------- search ----------
class TestSearch:
    def test_search_default_returns_results(self, primary_headers):
        r = requests.get(f"{BASE_URL}/api/profiles/search", headers=primary_headers)
        assert r.status_code == 200
        d = r.json()
        assert "results" in d and isinstance(d["results"], list)
        assert d["count"] == len(d["results"])
        for x in d["results"]:
            assert "compatibility" in x

    def test_search_filters(self, primary_headers):
        r = requests.get(
            f"{BASE_URL}/api/profiles/search",
            params={"gender": "Male", "religion": "Hindu", "ageFrom": 25, "ageTo": 40},
            headers=primary_headers,
        )
        assert r.status_code == 200
        for x in r.json()["results"]:
            assert x.get("gender") == "Male"
            assert (x.get("religion") or "").lower() == "hindu"
            if x.get("age") is not None:
                assert 25 <= x["age"] <= 40


# ---------- privacy ----------
class TestPrivacy:
    def test_privacy_hides_contact_from_other_viewer(self, primary_headers, sample_token):
        # sample user viewing primary user's profile
        me = requests.get(f"{BASE_URL}/api/auth/me", headers=primary_headers).json()
        primary_id = me["id"]
        headers = {"Authorization": f"Bearer {sample_token}"}
        r = requests.get(f"{BASE_URL}/api/profiles/{primary_id}", headers=headers)
        assert r.status_code == 200
        p = r.json()
        # By default hideMobile/hideEmail=True → should be None
        assert p.get("mobile") is None
        assert p.get("email") is None


# ---------- blocking ----------
class TestBlocking:
    def test_block_and_unblock_flow(self, primary_headers):
        # find a sample candidate id via search
        s = requests.get(f"{BASE_URL}/api/profiles/search?gender=Male&limit=5", headers=primary_headers).json()
        assert s["results"], "Need at least one candidate"
        target = s["results"][0]["id"]

        r = requests.post(f"{BASE_URL}/api/users/block/{target}", headers=primary_headers)
        assert r.status_code == 200

        # recommendations should not include blocked
        recs = requests.get(f"{BASE_URL}/api/recommendations?limit=50", headers=primary_headers).json()["recommendations"]
        assert all(c["id"] != target for c in recs)

        # search should not include blocked
        s2 = requests.get(f"{BASE_URL}/api/profiles/search?limit=100", headers=primary_headers).json()
        assert all(c["id"] != target for c in s2["results"])

        # unblock
        r = requests.post(f"{BASE_URL}/api/users/unblock/{target}", headers=primary_headers)
        assert r.status_code == 200


# ---------- delete account (kept last; uses throwaway user) ----------
class TestDeleteAccount:
    def test_register_then_delete_me(self):
        email = f"TEST_delete_{os.urandom(3).hex()}@truejodi.com"
        payload = {
            "profileFor": "Self", "gender": "Male", "fullName": "Delete Me",
            "age": 30, "religion": "Hindu", "community": "Brahmin",
            "education": "B.Tech", "occupation": "Engineer",
            "state": "Maharashtra", "district": "Mumbai",
            "mobile": "9999999999", "email": email, "password": "Password@123",
        }
        r = requests.post(f"{BASE_URL}/api/auth/register", json=payload)
        assert r.status_code == 200
        token = r.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        r = requests.delete(f"{BASE_URL}/api/users/me", headers=headers)
        assert r.status_code == 200
        # subsequent /me should fail
        r = requests.get(f"{BASE_URL}/api/auth/me", headers=headers)
        assert r.status_code == 401
