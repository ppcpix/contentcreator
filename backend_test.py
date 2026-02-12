import requests
import sys
import json
from datetime import datetime

class InstagramContentAPITester:
    def __init__(self, base_url="https://photo-content-ai.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def run_test(self, name, method, endpoint, expected_status, data=None, timeout=30):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=timeout)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=timeout)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=timeout)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=timeout)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json() if response.text else {}
                except:
                    response_data = {"raw_response": response.text}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"Response: {response.text[:200]}...")
                response_data = {"error": response.text}

            self.test_results.append({
                "name": name,
                "method": method,
                "endpoint": endpoint,
                "expected_status": expected_status,
                "actual_status": response.status_code,
                "success": success,
                "response_preview": str(response_data)[:100] + "..." if len(str(response_data)) > 100 else str(response_data)
            })

            return success, response_data

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            self.test_results.append({
                "name": name,
                "method": method,
                "endpoint": endpoint,
                "expected_status": expected_status,
                "actual_status": "ERROR",
                "success": False,
                "error": str(e)
            })
            return False, {}

    def test_basic_endpoints(self):
        """Test basic API endpoints"""
        print("\n=== TESTING BASIC ENDPOINTS ===")
        
        # Root endpoint
        self.run_test("API Root", "GET", "", 200)
        
        # Niches endpoint
        success, data = self.run_test("Get Niches", "GET", "niches", 200)
        if success and 'niches' in data:
            print(f"   Found niches: {data['niches']}")
        
        # Hashtags for wedding niche
        success, data = self.run_test("Get Wedding Hashtags", "GET", "hashtags/wedding", 200)
        if success and 'hashtags' in data:
            print(f"   Found {len(data['hashtags'])} hashtags for wedding")
        
        # Analytics endpoint
        success, data = self.run_test("Get Analytics", "GET", "analytics", 200)
        if success:
            print(f"   Analytics data keys: {list(data.keys()) if isinstance(data, dict) else 'Invalid format'}")

    def test_content_crud(self):
        """Test content CRUD operations"""
        print("\n=== TESTING CONTENT CRUD ===")
        
        # Get all content
        success, data = self.run_test("Get All Content", "GET", "content", 200)
        
        # Create content
        content_data = {
            "title": "Test Wedding Post",
            "caption": "Beautiful wedding ceremony at sunset beach. The golden hour lighting created magical moments for this lovely couple. 💕",
            "hashtags": ["#wedding", "#weddingphotography", "#sunset", "#beach"],
            "niche": "wedding",
            "status": "draft"
        }
        
        success, response = self.run_test("Create Content", "POST", "content", 200, content_data)
        content_id = None
        if success and 'id' in response:
            content_id = response['id']
            print(f"   Created content with ID: {content_id}")
        
        # Get specific content
        if content_id:
            self.run_test("Get Content by ID", "GET", f"content/{content_id}", 200)
            
            # Update content
            updated_data = {
                "title": "Updated Wedding Post",
                "caption": "Updated caption for the wedding post",
                "hashtags": ["#wedding", "#updated"],
                "niche": "wedding",
                "status": "draft"
            }
            self.run_test("Update Content", "PUT", f"content/{content_id}", 200, updated_data)
            
            # Delete content
            self.run_test("Delete Content", "DELETE", f"content/{content_id}", 200)

    def test_ai_features(self):
        """Test AI-powered features"""
        print("\n=== TESTING AI FEATURES ===")
        
        # Caption generation
        caption_request = {
            "niche": "wedding",
            "topic": "sunset beach ceremony",
            "tone": "professional",
            "include_cta": True
        }
        
        success, data = self.run_test("Generate Caption", "POST", "content/generate-caption", 200, caption_request, timeout=60)
        if success:
            print(f"   Generated caption length: {len(data.get('caption', ''))}")
            print(f"   Generated hashtags count: {len(data.get('hashtags', []))}")
        
        # Content ideas generation
        ideas_request = {
            "niche": "portrait",
            "count": 3
        }
        
        success, data = self.run_test("Generate Ideas", "POST", "content/generate-ideas", 200, ideas_request, timeout=60)
        if success and 'ideas' in data:
            print(f"   Generated {len(data['ideas'])} content ideas")
        
        # Image generation (this might take longer)
        image_request = {
            "prompt": "Professional wedding photography, bride and groom at sunset",
            "niche": "wedding",
            "provider": "gemini",
            "style": "professional photography"
        }
        
        print("   Note: Image generation test may take up to 60 seconds...")
        success, data = self.run_test("Generate Image", "POST", "content/generate-image", 200, image_request, timeout=90)
        if success:
            print(f"   Image generated with provider: {data.get('provider', 'unknown')}")

    def test_calendar_features(self):
        """Test calendar and scheduling features"""
        print("\n=== TESTING CALENDAR FEATURES ===")
        
        # Get calendar
        self.run_test("Get Calendar", "GET", "calendar", 200)
        
        # Get calendar for specific month
        self.run_test("Get Calendar for December 2024", "GET", "calendar?month=12&year=2024", 200)

    def print_summary(self):
        """Print test summary"""
        print(f"\n{'='*50}")
        print(f"📊 TEST SUMMARY")
        print(f"{'='*50}")
        print(f"Tests Run: {self.tests_run}")
        print(f"Tests Passed: {self.tests_passed}")
        print(f"Tests Failed: {self.tests_run - self.tests_passed}")
        print(f"Success Rate: {(self.tests_passed/self.tests_run*100):.1f}%" if self.tests_run > 0 else "0%")
        
        # Show failed tests
        failed_tests = [test for test in self.test_results if not test['success']]
        if failed_tests:
            print(f"\n❌ FAILED TESTS:")
            for test in failed_tests:
                error_msg = test.get('error', f"Status {test['actual_status']}")
                print(f"   - {test['name']}: {error_msg}")
        
        return self.tests_passed == self.tests_run

def main():
    print("🚀 Starting Instagram Content Creator API Tests")
    print("=" * 60)
    
    tester = InstagramContentAPITester()
    
    # Run all test suites
    tester.test_basic_endpoints()
    tester.test_content_crud()
    tester.test_ai_features()
    tester.test_calendar_features()
    
    # Print summary and return exit code
    success = tester.print_summary()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())