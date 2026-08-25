"""MongoDB connection and database configuration for TrueJodi.

This module keeps database connectivity independent from Emergent.
All connection details come from environment variables.
"""
from __future__ import annotations

import logging
import os

from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

logger = logging.getLogger(__name__)

MONGO_URL = os.getenv("MONGO_URL", "").strip()
DB_NAME = os.getenv("DB_NAME", "").strip()

if not MONGO_URL:
    raise RuntimeError(
        "MONGO_URL is required. Copy backend/.env.example to backend/.env "
        "and configure your MongoDB connection string."
    )

if not DB_NAME:
    raise RuntimeError(
        "DB_NAME is required. Copy backend/.env.example to backend/.env "
        "and set the TrueJodi database name."
    )

def _int_env(name: str, default: int) -> int:
    raw = os.getenv(name, str(default)).strip()
    try:
        value = int(raw)
    except ValueError as exc:
        raise RuntimeError(f"{name} must be an integer.") from exc
    if value < 0:
        raise RuntimeError(f"{name} must be zero or greater.")
    return value

MONGO_SERVER_SELECTION_TIMEOUT_MS = _int_env(
    "MONGO_SERVER_SELECTION_TIMEOUT_MS", 5000
)
MONGO_CONNECT_TIMEOUT_MS = _int_env("MONGO_CONNECT_TIMEOUT_MS", 10000)
MONGO_MAX_POOL_SIZE = _int_env("MONGO_MAX_POOL_SIZE", 50)
MONGO_MIN_POOL_SIZE = _int_env("MONGO_MIN_POOL_SIZE", 0)

client = AsyncIOMotorClient(
    MONGO_URL,
    serverSelectionTimeoutMS=MONGO_SERVER_SELECTION_TIMEOUT_MS,
    connectTimeoutMS=MONGO_CONNECT_TIMEOUT_MS,
    maxPoolSize=MONGO_MAX_POOL_SIZE,
    minPoolSize=MONGO_MIN_POOL_SIZE,
    retryWrites=True,
)
db: AsyncIOMotorDatabase = client[DB_NAME]


async def verify_database_connection() -> None:
    """Verify that MongoDB is reachable and the configured DB is usable."""
    await client.admin.command("ping")
    logger.info("MongoDB connection verified: database=%s", DB_NAME)


async def ensure_indexes() -> None:
    """Create application indexes that are safe to recreate on startup."""
    await db.users.create_index("email", unique=True, name="users_email_unique")
    await db.interests.create_index(
        [("from_user_id", 1), ("to_user_id", 1)],
        name="interests_from_to",
    )
    await db.interests.create_index(
        [("to_user_id", 1), ("status", 1)],
        name="interests_to_status",
    )
    await db.chats.create_index(
        [("participants", 1), ("last_message_at", -1)],
        name="chats_participants_last_message",
    )
    await db.messages.create_index(
        [("chat_id", 1), ("created_at", 1)],
        name="messages_chat_created",
    )
    await db.files.create_index(
        [("user_id", 1), ("is_deleted", 1)],
        name="files_user_deleted",
    )
    await db.reports.create_index(
        [("reported_user_id", 1), ("created_at", -1)],
        name="reports_user_created",
    )
    logger.info("MongoDB application indexes verified.")
