from fastapi.testclient import TestClient
from main import app
import pytest
import logging

# Set up logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

client = TestClient(app)

def test_register():
    # Test registration
    register_data = {
        "username": "testuser",
        "email": "test@example.com",
        "password": "Test123!",
        "full_name": "Test User"
    }
    
    logger.info("Testing registration endpoint...")
    response = client.post("/api/v1/auth/register", json=register_data)
    logger.debug(f"Registration response: {response.status_code} - {response.text}")
    
    assert response.status_code in [200, 201], f"Registration failed: {response.text}"
    assert "access_token" in response.json()
    
    return response.json()["access_token"]

def test_login():
    # Test login
    login_data = {
        "username": "testuser",
        "password": "Test123!"
    }
    
    logger.info("Testing login endpoint...")
    response = client.post("/api/v1/auth/login", data=login_data)
    logger.debug(f"Login response: {response.status_code} - {response.text}")
    
    assert response.status_code == 200, f"Login failed: {response.text}"
    assert "access_token" in response.json()

if __name__ == "__main__":
    # Run tests
    try:
        access_token = test_register()
        logger.info("Registration test passed ✓")
        test_login()
        logger.info("Login test passed ✓")
    except Exception as e:
        logger.error(f"Test failed: {str(e)}")
