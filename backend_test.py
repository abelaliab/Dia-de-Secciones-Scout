#!/usr/bin/env python3
"""
Comprehensive Backend API Test Suite for Scout Section Organizer
Tests all endpoints and the complete workflow from session creation to assignment
"""

import asyncio
import aiohttp
import json
import uuid
from typing import Dict, List, Any
import sys
import os

# Get backend URL from environment
BACKEND_URL = "https://7ae1f28c-7633-4fe0-b173-82ae8abf0bc4.preview.emergentagent.com/api"

class ScoutOrganizerTester:
    def __init__(self):
        self.session_id = None
        self.test_results = []
        self.session = None
        
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
        
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    def log_test(self, test_name: str, success: bool, message: str = "", data: Any = None):
        """Log test result"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}: {message}")
        self.test_results.append({
            "test": test_name,
            "success": success,
            "message": message,
            "data": data
        })
    
    async def test_health_check(self):
        """Test basic API health check"""
        try:
            async with self.session.get(f"{BACKEND_URL}/") as response:
                if response.status == 200:
                    data = await response.json()
                    self.log_test("Health Check", True, f"API responding: {data.get('message', '')}")
                    return True
                else:
                    self.log_test("Health Check", False, f"Status: {response.status}")
                    return False
        except Exception as e:
            self.log_test("Health Check", False, f"Connection error: {str(e)}")
            return False
    
    async def test_create_session(self):
        """Test session creation"""
        try:
            async with self.session.post(f"{BACKEND_URL}/session") as response:
                if response.status == 200:
                    data = await response.json()
                    self.session_id = data.get("session_id")
                    self.log_test("Create Session", True, f"Session created: {self.session_id}")
                    return True
                else:
                    self.log_test("Create Session", False, f"Status: {response.status}")
                    return False
        except Exception as e:
            self.log_test("Create Session", False, f"Error: {str(e)}")
            return False
    
    async def test_get_all_sessions(self):
        """Test getting all sessions"""
        try:
            async with self.session.get(f"{BACKEND_URL}/sessions") as response:
                if response.status == 200:
                    data = await response.json()
                    sessions = data.get("sessions", [])
                    self.log_test("Get All Sessions", True, f"Found {len(sessions)} sessions")
                    return True
                else:
                    self.log_test("Get All Sessions", False, f"Status: {response.status}")
                    return False
        except Exception as e:
            self.log_test("Get All Sessions", False, f"Error: {str(e)}")
            return False
    
    async def test_save_people(self):
        """Test saving people list with realistic scout data"""
        people_data = {
            "people": [
                {"name": "Juan Pérez", "option1": "Tropa", "option2": "Esculta", "veto": "Colonia"},
                {"name": "María García", "option1": "Manada", "option2": "Colonia", "veto": "Clan"},
                {"name": "Carlos López", "option1": "Esculta", "option2": "Clan", "veto": "Manada"},
                {"name": "Ana Martínez", "option1": "Colonia", "option2": "Manada", "veto": "Tropa"},
                {"name": "Diego Rodríguez", "option1": "Clan", "option2": "Esculta", "veto": "Colonia"},
                {"name": "Sofía Hernández", "option1": "Tropa", "option2": "Manada", "veto": "Clan"},
                {"name": "Miguel Torres", "option1": "Manada", "option2": "Tropa", "veto": "Esculta"},
                {"name": "Lucía Morales", "option1": "Esculta", "option2": "Clan", "veto": "Colonia"},
                {"name": "Andrés Jiménez", "option1": "Colonia", "option2": "Manada", "veto": "Tropa"},
                {"name": "Valentina Castro", "option1": "Clan", "option2": "Esculta", "veto": "Manada"}
            ],
            "session_id": self.session_id
        }
        
        try:
            async with self.session.post(f"{BACKEND_URL}/people", 
                                       json=people_data) as response:
                if response.status == 200:
                    data = await response.json()
                    self.log_test("Save People", True, f"Saved {len(people_data['people'])} people")
                    return True
                else:
                    text = await response.text()
                    self.log_test("Save People", False, f"Status: {response.status}, Response: {text}")
                    return False
        except Exception as e:
            self.log_test("Save People", False, f"Error: {str(e)}")
            return False
    
    async def test_get_people(self):
        """Test getting people list"""
        try:
            async with self.session.get(f"{BACKEND_URL}/people/{self.session_id}") as response:
                if response.status == 200:
                    data = await response.json()
                    people = data.get("people", [])
                    self.log_test("Get People", True, f"Retrieved {len(people)} people")
                    return True
                else:
                    self.log_test("Get People", False, f"Status: {response.status}")
                    return False
        except Exception as e:
            self.log_test("Get People", False, f"Error: {str(e)}")
            return False
    
    async def test_save_limits(self):
        """Test saving section limits"""
        limits_data = {
            "limits": {
                "Colonia": {"min": 1, "max": 3},
                "Manada": {"min": 2, "max": 4},
                "Tropa": {"min": 2, "max": 3},
                "Esculta": {"min": 1, "max": 2},
                "Clan": {"min": 1, "max": 2}
            }
        }
        
        try:
            async with self.session.post(f"{BACKEND_URL}/limits?session_id={self.session_id}", 
                                       json=limits_data) as response:
                if response.status == 200:
                    self.log_test("Save Limits", True, "Section limits saved successfully")
                    return True
                else:
                    text = await response.text()
                    self.log_test("Save Limits", False, f"Status: {response.status}, Response: {text}")
                    return False
        except Exception as e:
            self.log_test("Save Limits", False, f"Error: {str(e)}")
            return False
    
    async def test_get_limits(self):
        """Test getting section limits"""
        try:
            async with self.session.get(f"{BACKEND_URL}/limits/{self.session_id}") as response:
                if response.status == 200:
                    data = await response.json()
                    self.log_test("Get Limits", True, "Retrieved section limits")
                    return True
                else:
                    self.log_test("Get Limits", False, f"Status: {response.status}")
                    return False
        except Exception as e:
            self.log_test("Get Limits", False, f"Error: {str(e)}")
            return False
    
    async def test_save_continuity(self):
        """Test saving continuity list"""
        continuity_data = {
            "continuity_list": [
                {"name": "Juan Pérez", "section": "Tropa"},
                {"name": "María García", "section": "Manada"}
            ],
            "session_id": self.session_id
        }
        
        try:
            async with self.session.post(f"{BACKEND_URL}/continuity", 
                                       json=continuity_data) as response:
                if response.status == 200:
                    self.log_test("Save Continuity", True, "Continuity list saved successfully")
                    return True
                else:
                    text = await response.text()
                    self.log_test("Save Continuity", False, f"Status: {response.status}, Response: {text}")
                    return False
        except Exception as e:
            self.log_test("Save Continuity", False, f"Error: {str(e)}")
            return False
    
    async def test_get_continuity(self):
        """Test getting continuity list"""
        try:
            async with self.session.get(f"{BACKEND_URL}/continuity/{self.session_id}") as response:
                if response.status == 200:
                    data = await response.json()
                    continuity_list = data.get("continuity_list", [])
                    self.log_test("Get Continuity", True, f"Retrieved {len(continuity_list)} continuity items")
                    return True
                else:
                    self.log_test("Get Continuity", False, f"Status: {response.status}")
                    return False
        except Exception as e:
            self.log_test("Get Continuity", False, f"Error: {str(e)}")
            return False
    
    async def test_save_priorities(self):
        """Test saving restriction priorities"""
        priorities_data = {
            "priorities": {
                "sectionLimits": 1,
                "continuityList": 1,
                "firstPreference": 2,
                "secondPreference": 3
            }
        }
        
        try:
            async with self.session.post(f"{BACKEND_URL}/priorities?session_id={self.session_id}", 
                                       json=priorities_data) as response:
                if response.status == 200:
                    self.log_test("Save Priorities", True, "Restriction priorities saved successfully")
                    return True
                else:
                    text = await response.text()
                    self.log_test("Save Priorities", False, f"Status: {response.status}, Response: {text}")
                    return False
        except Exception as e:
            self.log_test("Save Priorities", False, f"Error: {str(e)}")
            return False
    
    async def test_get_priorities(self):
        """Test getting restriction priorities"""
        try:
            async with self.session.get(f"{BACKEND_URL}/priorities/{self.session_id}") as response:
                if response.status == 200:
                    data = await response.json()
                    self.log_test("Get Priorities", True, "Retrieved restriction priorities")
                    return True
                else:
                    self.log_test("Get Priorities", False, f"Status: {response.status}")
                    return False
        except Exception as e:
            self.log_test("Get Priorities", False, f"Error: {str(e)}")
            return False
    
    async def test_assignment_algorithm(self):
        """Test the main assignment algorithm"""
        assignment_request = {
            "session_id": self.session_id
        }
        
        try:
            async with self.session.post(f"{BACKEND_URL}/assign", 
                                       json=assignment_request) as response:
                if response.status == 200:
                    data = await response.json()
                    assignment = data.get("assignment", {})
                    statistics = assignment.get("statistics", {})
                    
                    # Validate assignment structure
                    assignments = assignment.get("assignments", {})
                    sections = ["Colonia", "Manada", "Tropa", "Esculta", "Clan"]
                    
                    all_sections_present = all(section in assignments for section in sections)
                    total_assigned = sum(len(assignments.get(section, [])) for section in sections)
                    
                    if all_sections_present and total_assigned > 0:
                        self.log_test("Assignment Algorithm", True, 
                                    f"Successfully assigned {total_assigned} people across all sections")
                        
                        # Log detailed statistics
                        print(f"   📊 Statistics: {statistics.get('totalPeople', 0)} total, "
                              f"{statistics.get('assigned', 0)} assigned")
                        satisfaction = statistics.get('satisfaction', {})
                        print(f"   🎯 Satisfaction: {satisfaction.get('firstChoice', 0)} first choice, "
                              f"{satisfaction.get('secondChoice', 0)} second choice, "
                              f"{satisfaction.get('other', 0)} other, "
                              f"{satisfaction.get('veto', 0)} veto")
                        
                        return True
                    else:
                        self.log_test("Assignment Algorithm", False, 
                                    "Invalid assignment structure or no people assigned")
                        return False
                else:
                    text = await response.text()
                    self.log_test("Assignment Algorithm", False, 
                                f"Status: {response.status}, Response: {text}")
                    return False
        except Exception as e:
            self.log_test("Assignment Algorithm", False, f"Error: {str(e)}")
            return False
    
    async def test_get_assignments(self):
        """Test getting assignment results"""
        try:
            async with self.session.get(f"{BACKEND_URL}/assignments/{self.session_id}") as response:
                if response.status == 200:
                    data = await response.json()
                    assignments = data.get("assignments", {})
                    self.log_test("Get Assignments", True, "Retrieved assignment results")
                    return True
                else:
                    self.log_test("Get Assignments", False, f"Status: {response.status}")
                    return False
        except Exception as e:
            self.log_test("Get Assignments", False, f"Error: {str(e)}")
            return False
    
    async def test_get_statistics(self):
        """Test getting assignment statistics"""
        try:
            async with self.session.get(f"{BACKEND_URL}/statistics/{self.session_id}") as response:
                if response.status == 200:
                    data = await response.json()
                    self.log_test("Get Statistics", True, "Retrieved assignment statistics")
                    return True
                else:
                    self.log_test("Get Statistics", False, f"Status: {response.status}")
                    return False
        except Exception as e:
            self.log_test("Get Statistics", False, f"Error: {str(e)}")
            return False
    
    async def test_move_person(self):
        """Test manual person movement between sections"""
        move_request = {
            "person_name": "Juan Pérez",
            "from_section": "Tropa",
            "to_section": "Esculta"
        }
        
        try:
            async with self.session.post(f"{BACKEND_URL}/assignments/{self.session_id}/move", 
                                       json=move_request) as response:
                if response.status == 200:
                    data = await response.json()
                    self.log_test("Move Person", True, f"Successfully moved {move_request['person_name']}")
                    return True
                else:
                    text = await response.text()
                    self.log_test("Move Person", False, f"Status: {response.status}, Response: {text}")
                    return False
        except Exception as e:
            self.log_test("Move Person", False, f"Error: {str(e)}")
            return False
    
    async def test_delete_session(self):
        """Test session deletion"""
        try:
            async with self.session.delete(f"{BACKEND_URL}/session/{self.session_id}") as response:
                if response.status == 200:
                    self.log_test("Delete Session", True, "Session deleted successfully")
                    return True
                else:
                    self.log_test("Delete Session", False, f"Status: {response.status}")
                    return False
        except Exception as e:
            self.log_test("Delete Session", False, f"Error: {str(e)}")
            return False
    
    async def test_error_handling(self):
        """Test error handling for invalid requests"""
        # Test getting non-existent session data
        fake_session_id = str(uuid.uuid4())
        
        try:
            async with self.session.get(f"{BACKEND_URL}/people/{fake_session_id}") as response:
                if response.status == 200:
                    data = await response.json()
                    people = data.get("people", [])
                    if len(people) == 0:
                        self.log_test("Error Handling", True, "Correctly handles non-existent session")
                        return True
                    else:
                        self.log_test("Error Handling", False, "Should return empty list for non-existent session")
                        return False
                else:
                    self.log_test("Error Handling", True, f"Correctly returns error status: {response.status}")
                    return True
        except Exception as e:
            self.log_test("Error Handling", False, f"Error: {str(e)}")
            return False
    
    async def run_complete_workflow_test(self):
        """Run the complete end-to-end workflow test"""
        print("🚀 Starting Scout Section Organizer Backend API Tests")
        print("=" * 60)
        
        # Test sequence
        tests = [
            ("Health Check", self.test_health_check),
            ("Create Session", self.test_create_session),
            ("Get All Sessions", self.test_get_all_sessions),
            ("Save People", self.test_save_people),
            ("Get People", self.test_get_people),
            ("Save Limits", self.test_save_limits),
            ("Get Limits", self.test_get_limits),
            ("Save Continuity", self.test_save_continuity),
            ("Get Continuity", self.test_get_continuity),
            ("Save Priorities", self.test_save_priorities),
            ("Get Priorities", self.test_get_priorities),
            ("Assignment Algorithm", self.test_assignment_algorithm),
            ("Get Assignments", self.test_get_assignments),
            ("Get Statistics", self.test_get_statistics),
            ("Move Person", self.test_move_person),
            ("Error Handling", self.test_error_handling),
            ("Delete Session", self.test_delete_session)
        ]
        
        passed = 0
        failed = 0
        
        for test_name, test_func in tests:
            try:
                success = await test_func()
                if success:
                    passed += 1
                else:
                    failed += 1
            except Exception as e:
                print(f"❌ FAIL {test_name}: Unexpected error: {str(e)}")
                failed += 1
        
        print("\n" + "=" * 60)
        print(f"📊 TEST SUMMARY")
        print(f"✅ Passed: {passed}")
        print(f"❌ Failed: {failed}")
        print(f"📈 Success Rate: {(passed/(passed+failed)*100):.1f}%")
        
        if failed == 0:
            print("🎉 All tests passed! Backend API is working correctly.")
        else:
            print("⚠️  Some tests failed. Check the details above.")
        
        return failed == 0

async def main():
    """Main test runner"""
    async with ScoutOrganizerTester() as tester:
        success = await tester.run_complete_workflow_test()
        return success

if __name__ == "__main__":
    try:
        success = asyncio.run(main())
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print("\n🛑 Tests interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"💥 Fatal error: {str(e)}")
        sys.exit(1)