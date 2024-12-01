from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
import sys
import os

# Add the parent directory to the Python path so we can import our modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import engine, SessionLocal

def clear_user_table():
    db = SessionLocal()
    try:
        print("Deleting all users from the database...")
        # Use raw SQL to bypass the ORM and its relationships
        db.execute(text("DELETE FROM users"))
        db.commit()
        print("Successfully deleted all users!")
    except Exception as e:
        print(f"Error occurred: {str(e)}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    clear_user_table()
