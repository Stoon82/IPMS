import requests
import json
import logging
import random
import string
from urllib.parse import urlencode
import time

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

BASE_URL = "http://localhost:8000/api/v1/auth"

def generate_random_string(length=8):
    """Generate a random string for unique usernames"""
    return ''.join(random.choices(string.ascii_lowercase + string.digits, k=length))

def test_register():
    """Test user registration endpoint"""
    random_suffix = generate_random_string()
    url = f"{BASE_URL}/register"
    data = {
        "username": f"testuser_{random_suffix}",
        "email": f"testuser_{random_suffix}@example.com",
        "password": "Test123!@#",
        "full_name": "Test User"
    }
    
    try:
        logger.info(f"Sending registration request to {url}")
        logger.info(f"Request data: {json.dumps(data, indent=2)}")
        
        response = requests.post(url, json=data, timeout=10)  # Add timeout
        
        logger.info(f"Register Response Status: {response.status_code}")
        try:
            response_body = response.json()
            logger.info(f"Register Response Body: {json.dumps(response_body, indent=2)}")
        except json.JSONDecodeError:
            logger.error(f"Failed to decode JSON response. Raw response: {response.text}")
            return False
        
        if response.status_code == 200:
            # Store the credentials for login test
            with open("test_credentials.json", "w") as f:
                json.dump({"username": data["username"], "password": data["password"]}, f)
            
        return response.status_code == 200
    except requests.exceptions.Timeout:
        logger.error("Registration request timed out after 10 seconds")
        return False
    except requests.exceptions.RequestException as e:
        logger.error(f"Register Error: {str(e)}")
        return False
    except Exception as e:
        logger.error(f"Unexpected error during registration: {str(e)}")
        return False

def test_login_password():
    """Test username/password login endpoint"""
    try:
        # Read credentials from file
        with open("test_credentials.json", "r") as f:
            credentials = json.load(f)
    except FileNotFoundError:
        logger.error("No test credentials found. Run registration test first.")
        return False
    
    url = f"{BASE_URL}/login"
    
    try:
        logger.info(f"Sending login request to {url}")
        logger.info(f"Using credentials: {credentials['username']}")
        
        response = requests.post(url, json=credentials, timeout=10)  # Add timeout
        
        logger.info(f"Password Login Response Status: {response.status_code}")
        try:
            if response.status_code == 200:
                response_body = response.json()
                logger.info(f"Login Response Body: {json.dumps(response_body, indent=2)}")
            else:
                logger.info(f"Login Response Text: {response.text}")
        except json.JSONDecodeError:
            logger.error(f"Failed to decode JSON response. Raw response: {response.text}")
            return False
            
        return response.status_code == 200
    except requests.exceptions.Timeout:
        logger.error("Login request timed out after 10 seconds")
        return False
    except requests.exceptions.RequestException as e:
        logger.error(f"Password Login Error: {str(e)}")
        return False
    except Exception as e:
        logger.error(f"Unexpected error during login: {str(e)}")
        return False

def test_login_invalid_password():
    """Test login with invalid password"""
    try:
        with open("test_credentials.json", "r") as f:
            credentials = json.load(f)
            credentials["password"] = "WrongPassword123!"
    except FileNotFoundError:
        logger.error("No test credentials found. Run registration test first.")
        return False
    
    url = f"{BASE_URL}/login"
    
    try:
        logger.info(f"Sending invalid login request to {url}")
        logger.info(f"Using username: {credentials['username']}")
        
        response = requests.post(url, json=credentials, timeout=10)  # Add timeout
        
        logger.info(f"Invalid Password Login Response Status: {response.status_code}")
        logger.info(f"Invalid Password Login Response Text: {response.text}")
        
        # We expect this to fail, so return True if we get 401
        return response.status_code == 401
    except requests.exceptions.Timeout:
        logger.error("Invalid login request timed out after 10 seconds")
        return False
    except requests.exceptions.RequestException as e:
        logger.error(f"Invalid Password Login Error: {str(e)}")
        return False
    except Exception as e:
        logger.error(f"Unexpected error during invalid login: {str(e)}")
        return False

def test_google_auth():
    """Test Google OAuth login flow"""
    url = f"{BASE_URL}/google/login"
    
    try:
        logger.info(f"Sending Google OAuth URL request to {url}")
        
        response = requests.get(url, timeout=10)  # Add timeout
        logger.info(f"Google Auth URL Response Status: {response.status_code}")
        
        if response.status_code == 200:
            try:
                data = response.json()
                auth_url = data.get("authorization_url")
                state = data.get("state")
                
                if not auth_url or not state:
                    logger.error("Missing authorization_url or state in response")
                    return False
                    
                logger.info(f"Successfully generated Google OAuth URL")
                logger.info(f"State parameter present: {bool(state)}")
                return True
            except json.JSONDecodeError:
                logger.error(f"Failed to decode JSON response. Raw response: {response.text}")
                return False
        else:
            logger.error(f"Failed to get Google OAuth URL: {response.text}")
            return False
    except requests.exceptions.Timeout:
        logger.error("Google OAuth request timed out after 10 seconds")
        return False
    except requests.exceptions.RequestException as e:
        logger.error(f"Google Auth Error: {str(e)}")
        return False
    except Exception as e:
        logger.error(f"Unexpected error during Google OAuth: {str(e)}")
        return False

def main():
    logger.info("Starting Authentication Tests...")
    
    # Test Registration
    logger.info("\n=== Testing Registration ===")
    registration_success = test_register()
    logger.info(f"Registration Test {'Passed' if registration_success else 'Failed'}")
    
    if not registration_success:
        logger.error("Registration failed, skipping remaining tests")
        return
    
    # Small delay between tests
    time.sleep(1)
    
    # Test Valid Password Login
    logger.info("\n=== Testing Password Login ===")
    login_success = test_login_password()
    logger.info(f"Password Login Test {'Passed' if login_success else 'Failed'}")
    
    # Small delay between tests
    time.sleep(1)
    
    # Test Invalid Password
    logger.info("\n=== Testing Invalid Password ===")
    invalid_login_success = test_login_invalid_password()
    logger.info(f"Invalid Password Test {'Passed' if invalid_login_success else 'Failed'}")
    
    # Small delay between tests
    time.sleep(1)
    
    # Test Google OAuth
    logger.info("\n=== Testing Google OAuth ===")
    google_auth_success = test_google_auth()
    logger.info(f"Google OAuth Test {'Passed' if google_auth_success else 'Failed'}")

if __name__ == "__main__":
    main()
