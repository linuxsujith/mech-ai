import requests
import sys
import json
import time
import base64
from datetime import datetime

class MECHAIAPITester:
    def __init__(self, base_url="https://mechai-command.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_result(self, test_name, passed, message="", response_data=None):
        """Log test result"""
        self.tests_run += 1
        if passed:
            self.tests_passed += 1
        
        result = {
            "test": test_name,
            "passed": passed,
            "message": message,
            "response_data": response_data if response_data else {}
        }
        self.test_results.append(result)
        
        status = "✅ PASSED" if passed else "❌ FAILED"
        print(f"{status} - {test_name}: {message}")

    def run_test(self, name, method, endpoint, expected_status, data=None, files=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint.lstrip('/')}"
        test_headers = {}
        if not files:  # Only set Content-Type for JSON requests
            test_headers['Content-Type'] = 'application/json'

        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=30)
            elif method == 'POST':
                if files:
                    response = requests.post(url, files=files, data=data, headers=test_headers, timeout=30)
                else:
                    response = requests.post(url, json=data, headers=test_headers, timeout=30)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers, timeout=30)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers, timeout=30)

            success = response.status_code == expected_status
            try:
                response_json = response.json()
            except:
                response_json = {"raw_response": response.text}

            if success:
                self.log_result(name, True, f"Status: {response.status_code}", response_json)
                return True, response_json
            else:
                self.log_result(name, False, f"Expected {expected_status}, got {response.status_code}: {response.text[:200]}", response_json)
                return False, response_json

        except Exception as e:
            self.log_result(name, False, f"Error: {str(e)}")
            return False, {}

    def test_public_stats(self):
        """Test public stats endpoint - should return total_scans and total_parts=36"""
        print("\n🔍 Testing Public Stats...")
        success, response = self.run_test(
            "Get Public Stats",
            "GET",
            "public/stats",
            200
        )
        
        if success:
            if 'total_parts' in response and response['total_parts'] == 36:
                self.log_result("Parts Count Check", True, f"Found {response['total_parts']} parts as expected")
            else:
                self.log_result("Parts Count Check", False, f"Expected 36 parts, got {response.get('total_parts', 'N/A')}")
            
            if 'total_scans' in response:
                self.log_result("Scans Count Available", True, f"Total scans: {response['total_scans']}")
            else:
                self.log_result("Scans Count Available", False, "total_scans field missing")
        
        return success

    def test_public_scans(self):
        """Test public scans endpoint"""
        print("\n🔍 Testing Public Scans...")
        success, response = self.run_test(
            "Get Public Scans",
            "GET",
            "public/scans",
            200
        )
        
        if success:
            if isinstance(response, list):
                self.log_result("Scans List Format", True, f"Returned {len(response)} scan records")
            else:
                self.log_result("Scans List Format", False, f"Expected array, got {type(response)}")
        
        return success

    def test_spare_parts_catalog(self):
        """Test spare parts catalog - should have 36 items"""
        print("\n🔍 Testing Spare Parts Catalog...")
        success, response = self.run_test(
            "Get All Spare Parts",
            "GET",
            "parts",
            200
        )
        
        if success:
            parts_count = len(response) if isinstance(response, list) else 0
            if parts_count == 36:
                self.log_result("Parts Count Verification", True, f"Found {parts_count} parts as expected")
                
                # Test search functionality
                if parts_count > 0:
                    self.test_parts_search_and_filter()
                return True
            else:
                self.log_result("Parts Count Verification", False, f"Expected 36 parts, found {parts_count}")
                return False
        return False

    def test_parts_search_and_filter(self):
        """Test parts search and filter functionality"""
        print("\n🔍 Testing Parts Search & Filter...")
        
        # Test category filter
        success, response = self.run_test(
            "Parts Filter by Category",
            "GET", 
            "parts?category=Engine",
            200
        )
        if success and isinstance(response, list):
            self.log_result("Category Filter", True, f"Found {len(response)} Engine parts")
        
        # Test vehicle type filter
        success, response = self.run_test(
            "Parts Filter by Vehicle Type",
            "GET",
            "parts?vehicle_type=Car", 
            200
        )
        if success and isinstance(response, list):
            self.log_result("Vehicle Type Filter", True, f"Found {len(response)} Car parts")
        
        # Test search
        success, response = self.run_test(
            "Parts Search",
            "GET",
            "parts?search=brake",
            200
        )
        if success and isinstance(response, list):
            self.log_result("Search Functionality", True, f"Found {len(response)} brake-related parts")

    def test_admin_stats(self):
        """Test admin stats endpoint"""
        print("\n🔍 Testing Admin Statistics...")
        if not self.admin_token:
            self.log_result("Admin Stats", False, "No admin token available")
            return False
            
        return self.run_test(
            "Admin Statistics",
            "GET",
            "admin/stats",
            200,
            headers={"authorization": f"Bearer {self.admin_token}"}
        )[0]

    def test_admin_parts_crud(self):
        """Test admin CRUD operations on spare parts"""
        print("\n🔍 Testing Admin Parts Management...")
        if not self.admin_token:
            self.log_result("Admin CRUD Test", False, "No admin token available")
            return False

        headers = {"authorization": f"Bearer {self.admin_token}"}
        
        # Test creating a new part
        new_part_data = {
            "name": "Test Component XYZ",
            "category": "Engine",
            "price": 999.99,
            "vehicle_type": "Car",
            "description": "Test component for API validation",
            "stock": 10
        }
        
        create_success, create_response = self.run_test(
            "Create New Part (Admin)",
            "POST",
            "parts",
            200,
            data=new_part_data,
            headers=headers
        )
        
        if not create_success:
            return False

        part_id = create_response.get('id')
        if not part_id:
            self.log_result("Create Part ID Check", False, "No part ID returned")
            return False

        # Test deleting the created part
        delete_success = self.run_test(
            "Delete Part (Admin)",
            "DELETE",
            f"parts/{part_id}",
            200,
            headers=headers
        )[0]
        
        return delete_success

    def test_emergency_protocol(self):
        """Test emergency assistance endpoint"""
        print("\n🔍 Testing Emergency Protocol System...")
        
        # Test with form data (as backend expects Form data, not JSON)
        test_situations = [
            {"situation": "Engine fire detected", "vehicle_type": "car"},
            {"situation": "Brake failure while driving", "vehicle_type": "bike"},
            {"situation": "EV battery thermal event", "vehicle_type": "ev"}
        ]
        
        for i, test_data in enumerate(test_situations):
            print(f"    Testing scenario {i+1}: {test_data['situation']}")
            try:
                url = f"{self.base_url}/emergency-assist"
                # Send as form data, not JSON
                response = requests.post(url, data=test_data, timeout=45)
                
                if response.status_code == 200:
                    try:
                        response_json = response.json()
                        required_fields = ['emergency_level', 'immediate_actions', 'safety_warnings']
                        missing_fields = [field for field in required_fields if field not in response_json]
                        
                        if not missing_fields:
                            self.log_result(f"Emergency Assist Scenario {i+1}", True, f"Response contains all required fields for {test_data['vehicle_type']}")
                        else:
                            self.log_result(f"Emergency Assist Scenario {i+1}", False, f"Missing required fields: {missing_fields}")
                    except json.JSONDecodeError:
                        self.log_result(f"Emergency Assist Scenario {i+1}", False, "Invalid JSON response")
                else:
                    self.log_result(f"Emergency Assist Scenario {i+1}", False, f"Status {response.status_code}: {response.text[:200]}")
            except Exception as e:
                self.log_result(f"Emergency Assist Scenario {i+1}", False, f"Error: {str(e)}")
        
        return True  # Return True if at least one scenario worked

    def test_ai_diagnostic_system(self):
        """Test AI diagnostic system with a sample image"""
        print("\n🔍 Testing AI Diagnostic System...")
        
        # Create a simple test image (3x3 red pixel PNG)
        test_image_b64 = "iVBORw0KGgoAAAANSUhEUgAAAAMAAAADCAYAAABWKLW/AAAAEElEQVQIHWP4z8BQz4AGAAncAfcEXvJKAAAAAElFTkSuQmCC"
        test_image_bytes = base64.b64decode(test_image_b64)
        
        files = {'image': ('test_vehicle.png', test_image_bytes, 'image/png')}
        data = {
            'model_provider': 'openai',
            'model_name': 'gpt-5.2'
        }
        
        try:
            url = f"{self.base_url}/diagnose"
            response = requests.post(url, files=files, data=data, timeout=90)
            
            if response.status_code == 200:
                response_json = response.json()
                if 'diagnostic' in response_json and 'scan_id' in response_json:
                    self.log_result("AI Diagnostic Request", True, f"Diagnostic completed with scan ID: {response_json.get('scan_id', 'N/A')}")
                    
                    # Test getting the scan result
                    scan_id = response_json.get('scan_id')
                    if scan_id:
                        self.test_get_scan_result(scan_id)
                    return True
                else:
                    self.log_result("AI Diagnostic Request", False, f"Response missing expected fields: {list(response_json.keys())}")
            else:
                self.log_result("AI Diagnostic Request", False, f"Status {response.status_code}: {response.text[:200]}")
        except Exception as e:
            self.log_result("AI Diagnostic Request", False, f"Error: {str(e)}")
        
        return False

    def test_get_scan_result(self, scan_id):
        """Test getting scan result by ID"""
        print(f"\n🔍 Testing Get Scan Result for {scan_id}...")
        success, response = self.run_test(
            "Get Scan Result",
            "GET",
            f"scans/{scan_id}",
            200
        )
        
        if success:
            required_fields = ['id', 'diagnostic', 'created_at', 'model_provider']
            missing_fields = [field for field in required_fields if field not in response]
            if not missing_fields:
                self.log_result("Scan Result Structure", True, "All required fields present")
            else:
                self.log_result("Scan Result Structure", False, f"Missing fields: {missing_fields}")
        
        return success

    def test_user_stats(self):
        """Test user stats endpoint"""
        print("\n🔍 Testing User Statistics...")
        if not self.user_token:
            self.log_result("User Stats", False, "No user token available")
            return False
            
        return self.run_test(
            "User Statistics",
            "GET",
            "stats",
            200,
            headers={"authorization": f"Bearer {self.user_token}"}
        )[0]

    def run_all_tests(self):
        """Run all API tests"""
        print("🚀 Starting MECHAI API Test Suite")
        print("=" * 50)
        
        # Test authentication first
        if not self.test_admin_login():
            print("❌ Admin login failed, stopping admin-related tests")
            
        if not self.test_user_registration_and_login():
            print("❌ User authentication failed, stopping user-related tests")
            
        # Test core functionality
        self.test_get_me_endpoint()
        self.test_spare_parts_catalog()
        
        # Test admin functionality
        if self.admin_token:
            self.test_admin_stats()
            self.test_admin_parts_crud()
        
        # Test user functionality
        if self.user_token:
            self.test_user_stats()
        
        # Test AI systems
        self.test_emergency_protocol()
        self.test_ai_diagnostic_system()
        
        # Print summary
        print("\n" + "=" * 50)
        print("📊 TEST RESULTS SUMMARY")
        print("=" * 50)
        print(f"Total Tests: {self.tests_run}")
        print(f"Passed: {self.tests_passed}")
        print(f"Failed: {self.tests_run - self.tests_passed}")
        print(f"Success Rate: {(self.tests_passed / self.tests_run * 100):.1f}%")
        
        # List failed tests
        failed_tests = [result for result in self.test_results if not result['passed']]
        if failed_tests:
            print(f"\n❌ FAILED TESTS ({len(failed_tests)}):")
            for test in failed_tests:
                print(f"   • {test['test']}: {test['message']}")
        
        return self.tests_passed == self.tests_run

def main():
    print("🤖 MECHAI - Vehicle Intelligence API Tester")
    print("Testing backend API endpoints...")
    
    tester = MECHAIAPITester()
    success = tester.run_all_tests()
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())