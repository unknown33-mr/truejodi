"""Interest flow tests for Truejodi Matrimony.
Covers: send/received/sent/respond/status endpoints, idempotency,
self-send, unknown target, permission, invalid actions, and
contact unlock on accept for both parties across
/api/profiles/{id}, /api/profiles/search, /api/recommendations.

State is reset by directly deleting relevant docs from db.interests
before running (deterministic).
"""
import os
import pytest
import requests
from pymongo import MongoClient

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "http://localhost:8001").rstrip("/")

# --- Cleanup: reset any interests involving the two test pairs ---
MONGO_URL = os.environ["MONGO_URL"]
DB_NAME = os.environ["DB_NAME"]

PRIMARY = ("testuser@truejodi.com", "testpass123")
SNEHA = ("sneha.kapoor@truejodi.com", "Password@123")
MEERA = ("meera.nair@truejodi.com", "Password@123")
ROHAN = ("rohan.verma@truejodi.com", "Password@123")


def _login(email, pwd):
    r = requests.post(f"{BASE_URL}/api/auth/login", json={"email": email, "password": pwd})
    assert r.status_code == 200, f"login failed for {email}: {r.text}"
    return r.json()["access_token"], r.json()["user"]["id"]


@pytest.fixture(scope="module")
def db():
    c = MongoClient(MONGO_URL)
    d = c[DB_NAME]
    yield d
    c.close()


@pytest.fixture(scope="module")
def users(db):
    """Login each and return dict of {name: (token, id)} plus cleanup all
    interests among them so the test suite runs deterministically."""
    prim_tok, prim_id = _login(*PRIMARY)
    sne_tok, sne_id = _login(*SNEHA)
    mee_tok, mee_id = _login(*MEERA)
    roh_tok, roh_id = _login(*ROHAN)
    ids = [prim_id, sne_id, mee_id, roh_id]
    db.interests.delete_many({
        "$or": [
            {"from_user_id": {"$in": ids}, "to_user_id": {"$in": ids}},
        ]
    })
    return {
        "primary": (prim_tok, prim_id),
        "sneha":   (sne_tok, sne_id),
        "meera":   (mee_tok, mee_id),
        "rohan":   (roh_tok, roh_id),
    }


def _h(tok):
    return {"Authorization": f"Bearer {tok}"}


# ---------------- send ----------------
class TestSendInterest:
    def test_send_to_self_400(self, users):
        tok, uid = users["primary"]
        r = requests.post(f"{BASE_URL}/api/interests/send/{uid}", headers=_h(tok))
        assert r.status_code == 400

    def test_send_to_unknown_404(self, users):
        tok, _ = users["primary"]
        r = requests.post(f"{BASE_URL}/api/interests/send/does-not-exist-xyz", headers=_h(tok))
        assert r.status_code == 404

    def test_send_creates_pending(self, users):
        tok, _ = users["primary"]
        _, sne_id = users["sneha"]
        r = requests.post(f"{BASE_URL}/api/interests/send/{sne_id}", headers=_h(tok))
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["interest"]["status"] == "pending"
        assert d["interest"]["to_user_id"] == sne_id

    def test_send_idempotent(self, users):
        """Second send returns the same existing interest without creating a duplicate."""
        tok, _ = users["primary"]
        _, sne_id = users["sneha"]
        r = requests.post(f"{BASE_URL}/api/interests/send/{sne_id}", headers=_h(tok))
        assert r.status_code == 200
        first_id = r.json()["interest"]["id"]
        r2 = requests.post(f"{BASE_URL}/api/interests/send/{sne_id}", headers=_h(tok))
        assert r2.status_code == 200
        assert r2.json()["interest"]["id"] == first_id
        assert r2.json()["interest"]["status"] == "pending"


# ---------------- received/sent lists ----------------
class TestListInterests:
    def test_sent_includes_to_user(self, users):
        tok, _ = users["primary"]
        _, sne_id = users["sneha"]
        r = requests.get(f"{BASE_URL}/api/interests/sent", headers=_h(tok))
        assert r.status_code == 200
        items = r.json()["interests"]
        assert any(i["to_user"]["id"] == sne_id for i in items)
        # to_user snapshot present and non-empty
        one = next(i for i in items if i["to_user"]["id"] == sne_id)
        assert one["to_user"].get("fullName")
        assert one["status"] == "pending"
        # Contact stays hidden while pending
        assert one["to_user"].get("mobile") is None
        assert one["to_user"].get("email") is None

    def test_received_from_recipient_side(self, users):
        tok, _ = users["sneha"]
        _, prim_id = users["primary"]
        r = requests.get(f"{BASE_URL}/api/interests/received", headers=_h(tok))
        assert r.status_code == 200
        items = r.json()["interests"]
        assert any(i["from_user"]["id"] == prim_id for i in items)
        one = next(i for i in items if i["from_user"]["id"] == prim_id)
        assert one["status"] == "pending"
        assert one["from_user"].get("mobile") is None


# ---------------- status ----------------
class TestStatus:
    def test_status_pending_sent(self, users):
        tok, _ = users["primary"]
        _, sne_id = users["sneha"]
        r = requests.get(f"{BASE_URL}/api/interests/status/{sne_id}", headers=_h(tok))
        assert r.status_code == 200
        d = r.json()
        assert d["status"] == "pending"
        assert d["direction"] == "sent"
        assert d["interest_id"]

    def test_status_pending_received(self, users):
        tok, _ = users["sneha"]
        _, prim_id = users["primary"]
        r = requests.get(f"{BASE_URL}/api/interests/status/{prim_id}", headers=_h(tok))
        assert r.status_code == 200
        d = r.json()
        assert d["status"] == "pending"
        assert d["direction"] == "received"

    def test_status_none(self, users):
        tok, _ = users["primary"]
        _, mee_id = users["meera"]
        r = requests.get(f"{BASE_URL}/api/interests/status/{mee_id}", headers=_h(tok))
        assert r.status_code == 200
        assert r.json()["status"] == "none"


# ---------------- respond ----------------
class TestRespond:
    def test_wrong_recipient_403(self, users):
        # meera tries to respond to interest sent primary->sneha
        tok_prim, _ = users["primary"]
        _, sne_id = users["sneha"]
        status = requests.get(f"{BASE_URL}/api/interests/status/{sne_id}", headers=_h(tok_prim)).json()
        interest_id = status["interest_id"]
        tok_mee, _ = users["meera"]
        r = requests.post(f"{BASE_URL}/api/interests/{interest_id}/respond",
                          json={"action": "accept"}, headers=_h(tok_mee))
        assert r.status_code == 403

    def test_invalid_action_400(self, users):
        tok_prim, _ = users["primary"]
        _, sne_id = users["sneha"]
        interest_id = requests.get(f"{BASE_URL}/api/interests/status/{sne_id}",
                                   headers=_h(tok_prim)).json()["interest_id"]
        tok_sne, _ = users["sneha"]
        r = requests.post(f"{BASE_URL}/api/interests/{interest_id}/respond",
                          json={"action": "maybe"}, headers=_h(tok_sne))
        assert r.status_code == 400

    def test_accept_ok(self, users):
        tok_prim, _ = users["primary"]
        _, sne_id = users["sneha"]
        interest_id = requests.get(f"{BASE_URL}/api/interests/status/{sne_id}",
                                   headers=_h(tok_prim)).json()["interest_id"]
        tok_sne, _ = users["sneha"]
        r = requests.post(f"{BASE_URL}/api/interests/{interest_id}/respond",
                          json={"action": "accept"}, headers=_h(tok_sne))
        assert r.status_code == 200
        assert r.json()["status"] == "accepted"

    def test_respond_after_accept_400(self, users):
        tok_prim, _ = users["primary"]
        _, sne_id = users["sneha"]
        interest_id = requests.get(f"{BASE_URL}/api/interests/status/{sne_id}",
                                   headers=_h(tok_prim)).json()["interest_id"]
        tok_sne, _ = users["sneha"]
        r = requests.post(f"{BASE_URL}/api/interests/{interest_id}/respond",
                          json={"action": "decline"}, headers=_h(tok_sne))
        assert r.status_code == 400


# ---------------- contact unlock ----------------
class TestContactUnlock:
    def test_profile_detail_unlocked_both_directions(self, users):
        tok_prim, prim_id = users["primary"]
        tok_sne, sne_id = users["sneha"]

        # Primary viewing Sneha
        r1 = requests.get(f"{BASE_URL}/api/profiles/{sne_id}", headers=_h(tok_prim))
        assert r1.status_code == 200
        p1 = r1.json()
        assert p1.get("mobile"), f"Expected mobile unlocked, got {p1.get('mobile')}"
        assert p1.get("email"), "Expected email unlocked"
        assert p1["interest"]["status"] == "accepted"

        # Sneha viewing Primary
        r2 = requests.get(f"{BASE_URL}/api/profiles/{prim_id}", headers=_h(tok_sne))
        assert r2.status_code == 200
        p2 = r2.json()
        assert p2.get("mobile"), "Expected primary mobile unlocked for Sneha"
        assert p2.get("email")
        assert p2["interest"]["status"] == "accepted"

    def test_search_reveals_contact_only_for_accepted(self, users):
        tok_prim, _ = users["primary"]
        _, sne_id = users["sneha"]
        r = requests.get(f"{BASE_URL}/api/profiles/search?limit=100", headers=_h(tok_prim))
        assert r.status_code == 200
        results = r.json()["results"]
        # Find Sneha in results — she should have interest.status == accepted and unlocked
        sneha_row = next((x for x in results if x["id"] == sne_id), None)
        # She may be filtered out by gender (primary female, target female). If so, use recommendations/profile flow only.
        if sneha_row is not None:
            assert sneha_row["interest"]["status"] == "accepted"
            assert sneha_row.get("mobile")
            assert sneha_row.get("email")
        # Also ensure ALL non-accepted rows are hidden
        for x in results:
            if x["interest"]["status"] != "accepted":
                assert x.get("mobile") is None, f"leak on {x['id']}"
                assert x.get("email") is None, f"leak on {x['id']}"

    def test_recommendations_interest_field(self, users):
        tok_prim, _ = users["primary"]
        r = requests.get(f"{BASE_URL}/api/recommendations?limit=20", headers=_h(tok_prim))
        assert r.status_code == 200
        for row in r.json()["recommendations"]:
            assert "interest" in row
            assert row["interest"]["status"] in ("none", "pending", "accepted", "declined")
            if row["interest"]["status"] != "accepted":
                assert row.get("mobile") is None

    def test_pending_keeps_contact_hidden(self, users):
        # New pending pair: primary -> meera
        tok_prim, _ = users["primary"]
        _, mee_id = users["meera"]
        r = requests.post(f"{BASE_URL}/api/interests/send/{mee_id}", headers=_h(tok_prim))
        assert r.status_code == 200
        r2 = requests.get(f"{BASE_URL}/api/profiles/{mee_id}", headers=_h(tok_prim))
        assert r2.status_code == 200
        assert r2.json().get("mobile") is None
        assert r2.json().get("email") is None
        assert r2.json()["interest"]["status"] == "pending"

    def test_declined_keeps_contact_hidden(self, users, db):
        # rohan -> primary, primary declines, contact should stay hidden
        tok_roh, _ = users["rohan"]
        _, prim_id = users["primary"]
        # ensure clean slate
        db.interests.delete_many({
            "$or": [
                {"from_user_id": users["rohan"][1], "to_user_id": prim_id},
                {"to_user_id": users["rohan"][1], "from_user_id": prim_id},
            ]
        })
        r = requests.post(f"{BASE_URL}/api/interests/send/{prim_id}", headers=_h(tok_roh))
        assert r.status_code == 200
        interest_id = r.json()["interest"]["id"]
        tok_prim, _ = users["primary"]
        r2 = requests.post(f"{BASE_URL}/api/interests/{interest_id}/respond",
                           json={"action": "decline"}, headers=_h(tok_prim))
        assert r2.status_code == 200
        # Rohan viewing primary
        r3 = requests.get(f"{BASE_URL}/api/profiles/{prim_id}", headers=_h(tok_roh))
        assert r3.json().get("mobile") is None
        assert r3.json()["interest"]["status"] == "declined"
