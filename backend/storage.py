"""Portable local file storage for TrueJodi.

Files are stored under backend/uploads by default. The database stores a
relative storage_path, so the application can be moved to another server
without depending on Emergent Object Storage.
"""
from pathlib import Path
import os
import re
from fastapi import HTTPException

ROOT_DIR = Path(__file__).resolve().parent
UPLOAD_DIR = Path(os.environ.get("UPLOAD_DIR", str(ROOT_DIR / "uploads")))
if not UPLOAD_DIR.is_absolute():
    UPLOAD_DIR = ROOT_DIR / UPLOAD_DIR

STORAGE_PROVIDER = os.environ.get("STORAGE_PROVIDER", "local").strip().lower()


def ensure_storage_dir() -> None:
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


def _safe_relative_path(path: str) -> Path:
    """Resolve a DB storage path safely inside UPLOAD_DIR."""
    clean = str(path or "").replace("\\", "/").lstrip("/")
    if not clean or "\x00" in clean:
        raise HTTPException(status_code=400, detail="Invalid storage path")
    relative = Path(clean)
    if any(part in ("", ".", "..") for part in relative.parts):
        raise HTTPException(status_code=400, detail="Invalid storage path")
    target = (UPLOAD_DIR / relative).resolve()
    base = UPLOAD_DIR.resolve()
    if target != base and base not in target.parents:
        raise HTTPException(status_code=400, detail="Invalid storage path")
    return target


def put_object(path: str, data: bytes, content_type: str) -> dict:
    if STORAGE_PROVIDER not in {"local", "portable"}:
        raise HTTPException(status_code=500, detail=f"Unsupported storage provider: {STORAGE_PROVIDER}")
    target = _safe_relative_path(path)
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_bytes(data)
    return {"path": path.replace("\\", "/"), "size": len(data), "content_type": content_type}


def get_object(path: str):
    target = _safe_relative_path(path)
    if not target.is_file():
        raise HTTPException(status_code=404, detail="File not found")
    try:
        return target.read_bytes()
    except OSError as exc:
        raise HTTPException(status_code=500, detail="Unable to read file") from exc


def delete_object(path: str) -> None:
    target = _safe_relative_path(path)
    if target.is_file():
        try:
            target.unlink()
        except OSError:
            # Database soft-delete still proceeds; cleanup can be retried.
            pass
