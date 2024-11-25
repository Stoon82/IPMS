import requests
import json
import logging
from datetime import datetime

# Set up logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler(f'auth_test_{datetime.now().strftime("%Y%m%d_%H%M%S")}.log')
    ]
)
logger = logging.getLogger(__name__)

# API Base URL
BASE_URL = "http://localhost:8000/api/v1/auth"

def test_register():
    """Test the registration endpoint"""
    url = f"{BASE_URL}/register"
    
    # Test data
    data = {
        "username": f"testuser_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
        "email": f"testuser_{datetime.now().strftime('%Y%m%d_%H%M%S')}@example.com",
        "password": "TestPass123!",
        "full_name": "Test User"
    }
    
    try:
        logger.info(f"Testing registration endpoint: POST {url}")
        logger.debug(f"Request data: {json.dumps(data, indent=2)}")
        
        response = requests.post(
            url,
            json=data,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        # Log response details
        logger.debug(f"Status Code: {response.status_code}")
        logger.debug(f"Response Headers: {json.dumps(dict(response.headers), indent=2)}")
        logger.debug(f"Response Body: {response.text}")
        
        if response.status_code in [200, 201]:
            logger.info("✓ Registration successful")
            return response.json(), data
        else:
            logger.error(f"✗ Registration failed: {response.text}")
            return None, data
            
    except requests.exceptions.ConnectionError:
        logger.error("✗ Connection failed. Is the server running?")
        return None, data
    except Exception as e:
        logger.error(f"✗ Error during registration: {str(e)}")
        return None, data

def test_login(credentials=None):
    """Test the login endpoint"""
    url = f"{BASE_URL}/login"
    
    # Test data - using the same credentials as registration if provided
    data = {
        "username": credentials["username"] if credentials else "testuser123",
        "password": credentials["password"] if credentials else "TestPass123!"
    }
    
    try:
        logger.info(f"Testing login endpoint: POST {url}")
        logger.debug(f"Request data: {json.dumps(data, indent=2)}")
        
        response = requests.post(
            url,
            data=data,  # Using form data for login
            timeout=10
        )
        
        # Log response details
        logger.debug(f"Status Code: {response.status_code}")
        logger.debug(f"Response Headers: {json.dumps(dict(response.headers), indent=2)}")
        logger.debug(f"Response Body: {response.text}")
        
        if response.status_code == 200:
            logger.info("✓ Login successful")
            return response.json()
        else:
            logger.error(f"✗ Login failed: {response.text}")
            return None
            
    except requests.exceptions.ConnectionError:
        logger.error("✗ Connection failed. Is the server running?")
        return None
    except Exception as e:
        logger.error(f"✗ Error during login: {str(e)}")
        return None

def test_auth_flow():
    """Test the complete authentication flow"""
    logger.info("\n=== Starting Authentication Flow Test ===")
    
    # Step 1: Register new user
    logger.info("\n1. Testing Registration")
    reg_result, credentials = test_register()
    
    if not reg_result:
        logger.error("✗ Authentication flow failed at registration")
        return False
    
    # Step 2: Login with new user
    logger.info("\n2. Testing Login")
    login_result = test_login(credentials)
    
    if not login_result:
        logger.error("✗ Authentication flow failed at login")
        return False
    
    logger.info("\n✓ Authentication flow completed successfully")
    return True

if __name__ == "__main__":
    logger.info("Starting authentication endpoint tests...")
    success = test_auth_flow()
    
    # Final summary
    logger.info("\n=== Test Summary ===")
    if success:
        logger.info("✓ All tests passed successfully")
    else:
        logger.error("✗ Tests failed")
