from sqlalchemy import create_engine, MetaData
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, registry
from config import settings
import logging
import os

logger = logging.getLogger(__name__)

# Create a registry for managing models
mapper_registry = registry()
Base = mapper_registry.generate_base()

# Create a single metadata instance
metadata = Base.metadata

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
        import models  # Import all models to ensure they are registered with SQLAlchemy
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables created successfully")
    except Exception as e:
        logger.error(f"Failed to create database tables: {str(e)}")
        raise
