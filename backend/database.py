from sqlalchemy import create_engine, MetaData
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import logging
import os
from config import settings

logger = logging.getLogger(__name__)

# Create a single Base class for all models
Base = declarative_base()

# Ensure the database directory exists
db_path = os.path.dirname(settings.DATABASE_URL.replace('sqlite:///', ''))
if not os.path.exists(db_path) and db_path:
    os.makedirs(db_path)
    logger.info(f"Created database directory: {db_path}")

logger.info(f"Initializing database with URL: {settings.DATABASE_URL}")

try:
    engine = create_engine(
        settings.DATABASE_URL,
        connect_args={"check_same_thread": False},
        echo=False  # Disable SQL logging for better performance
    )
    logger.info("Database engine created successfully")
except Exception as e:
    logger.error(f"Failed to create database engine: {e}")
    raise

try:
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    logger.info("Session maker created successfully")
except Exception as e:
    logger.error(f"Failed to create session maker: {e}")
    raise

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    """Initialize the database by creating all tables."""
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables created successfully")
    except Exception as e:
        logger.error(f"Failed to create database tables: {e}")
        raise
