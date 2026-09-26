"""
Database connection and lifecycle management for MongoDB.
Supports connection pooling, graceful fallback, and index initialization.
"""

import logging
from typing import Optional
from pymongo import MongoClient, ASCENDING, DESCENDING
from pymongo.database import Database
import mongomock

from app.config import settings

logger = logging.getLogger("phishing_detector.database")

_client: Optional[MongoClient] = None
_db: Optional[Database] = None
_is_mock: bool = False


def connect_to_database() -> Database:
    """
    Initializes a persistent MongoClient with connection pooling.
    Tries real MongoDB first; falls back to mongomock if local MongoDB is offline.
    """
    global _client, _db, _is_mock

    if _db is not None:
        return _db

    # Attempt real MongoDB connection
    try:
        logger.info(f"Connecting to MongoDB at {settings.MONGODB_URI}...")
        client = MongoClient(
            settings.MONGODB_URI,
            serverSelectionTimeoutMS=2000,
            maxPoolSize=50,
            minPoolSize=5
        )
        # Test connection
        client.admin.command("ping")
        _client = client
        _db = _client[settings.MONGODB_DB_NAME]
        _is_mock = False
        logger.info(f"Successfully connected to MongoDB database '{settings.MONGODB_DB_NAME}'")
    except Exception as e:
        logger.warning(
            f"Could not connect to external MongoDB ({e}). "
            f"Falling back to high-performance in-memory MongoMock for local execution/testing."
        )
        _client = mongomock.MongoClient()
        _db = _client[settings.MONGODB_DB_NAME]
        _is_mock = True

    # Initialize collections and indexes
    init_indexes(_db)
    return _db


def init_indexes(db: Database):
    """
    Creates necessary database indexes for fast queries and uniqueness constraints.
    """
    try:
        # Unique index on user email
        db.users.create_index([("email", ASCENDING)], unique=True)
        # Scan queries by user and creation time
        db.scans.create_index([("user_id", ASCENDING)])
        db.scans.create_index([("created_at", DESCENDING)])
        db.scans.create_index([("prediction", ASCENDING)])
        logger.info("MongoDB indexes verified.")
    except Exception as e:
        logger.warning(f"Note on index creation: {e}")


def get_database() -> Database:
    """
    FastAPI dependency and internal utility for accessing the database.
    """
    if _db is None:
        return connect_to_database()
    return _db


def close_database():
    """
    Closes the MongoDB connection pool cleanly.
    """
    global _client, _db
    if _client is not None:
        _client.close()
        _client = None
        _db = None
        logger.info("MongoDB connection closed.")


def is_database_mock() -> bool:
    return _is_mock


def format_doc(doc: Optional[dict]) -> Optional[dict]:
    """
    Converts MongoDB _id ObjectId to string id for frontend JSON compatibility.
    """
    if not doc:
        return None
    d = dict(doc)
    if "_id" in d:
        d["id"] = str(d.pop("_id"))
    if "user_id" in d and d["user_id"] is not None:
        d["user_id"] = str(d["user_id"])
    return d
