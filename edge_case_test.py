#!/usr/bin/env python3
"""
Additional Edge Case Tests for Scout Section Organizer Backend
Tests various edge cases and scenarios
"""

import asyncio
import aiohttp
import json
import uuid
from typing import Dict, List, Any
import sys

BACKEND_URL = "https://7ae1f28c-7633-4fe0-b173-82ae8abf0bc4.preview.emergentagent.com/api"

class EdgeCaseTester:
    def __init__(self):
        self.session = None
        self.test_results = []
        
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
        
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    def log_test(self, test_name: str, success: bool, message: str = ""):
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}: {message}")
        self.test_results.append({"test": test_name, "success": success, "message": message})
    
    async def test_assignment_with_no_limits(self):
        """Test assignment when no limits are set"""
        try:
            # Create session
            async with self.session.post(f"{BACKEND_URL}/session") as response:
                data = await response.json()
                session_id = data["session_id"]
            
            # Add people
            people_data = {
                "people": [
                    {"name": "Test Person 1", "option1": "Tropa", "option2": "Esculta", "veto": "Colonia"},
                    {"name": "Test Person 2", "option1": "Manada", "option2": "Colonia", "veto": "Clan"}
                ],
                "session_id": session_id
            }
            await self.session.post(f"{BACKEND_URL}/people", json=people_data)
            
            # Try assignment without limits
            assignment_request = {"session_id": session_id}
            async with self.session.post(f"{BACKEND_URL}/assign", json=assignment_request) as response:
                if response.status == 400:
                    self.log_test("Assignment Without Limits", True, "Correctly rejects assignment without limits")
                    success = True
                else:
                    self.log_test("Assignment Without Limits", False, f"Should reject assignment without limits, got status: {response.status}")
                    success = False
            
            # Cleanup
            await self.session.delete(f"{BACKEND_URL}/session/{session_id}")
            return success
            
        except Exception as e:
            self.log_test("Assignment Without Limits", False, f"Error: {str(e)}")
            return False
    
    async def test_assignment_with_conflicting_preferences(self):
        """Test assignment algorithm with challenging preference conflicts"""
        try:
            # Create session
            async with self.session.post(f"{BACKEND_URL}/session") as response:
                data = await response.json()
                session_id = data["session_id"]
            
            # Add people with conflicting preferences (everyone wants Tropa)
            people_data = {
                "people": [
                    {"name": "Scout 1", "option1": "Tropa", "option2": "Esculta", "veto": "Colonia"},
                    {"name": "Scout 2", "option1": "Tropa", "option2": "Manada", "veto": "Clan"},
                    {"name": "Scout 3", "option1": "Tropa", "option2": "Esculta", "veto": "Manada"},
                    {"name": "Scout 4", "option1": "Tropa", "option2": "Clan", "veto": "Colonia"},
                    {"name": "Scout 5", "option1": "Tropa", "option2": "Manada", "veto": "Esculta"}
                ],
                "session_id": session_id
            }
            await self.session.post(f"{BACKEND_URL}/people", json=people_data)
            
            # Set tight limits (only 2 people can go to Tropa)
            limits_data = {
                "limits": {
                    "Colonia": {"min": 0, "max": 2},
                    "Manada": {"min": 0, "max": 2},
                    "Tropa": {"min": 0, "max": 2},
                    "Esculta": {"min": 0, "max": 2},
                    "Clan": {"min": 0, "max": 2}
                }
            }
            await self.session.post(f"{BACKEND_URL}/limits?session_id={session_id}", json=limits_data)
            
            # Execute assignment
            assignment_request = {"session_id": session_id}
            async with self.session.post(f"{BACKEND_URL}/assign", json=assignment_request) as response:
                if response.status == 200:
                    data = await response.json()
                    assignment = data["assignment"]
                    assignments = assignment["assignments"]
                    
                    # Check that only 2 people got Tropa (their first choice)
                    tropa_count = len(assignments.get("Tropa", []))
                    total_assigned = sum(len(section) for section in assignments.values())
                    
                    if tropa_count <= 2 and total_assigned == 5:
                        self.log_test("Conflicting Preferences", True, f"Correctly handled conflicts: {tropa_count} in Tropa, {total_assigned} total assigned")
                        success = True
                    else:
                        self.log_test("Conflicting Preferences", False, f"Assignment issue: {tropa_count} in Tropa, {total_assigned} total assigned")
                        success = False
                else:
                    self.log_test("Conflicting Preferences", False, f"Assignment failed with status: {response.status}")
                    success = False
            
            # Cleanup
            await self.session.delete(f"{BACKEND_URL}/session/{session_id}")
            return success
            
        except Exception as e:
            self.log_test("Conflicting Preferences", False, f"Error: {str(e)}")
            return False
    
    async def test_continuity_priority(self):
        """Test that continuity list takes priority over preferences"""
        try:
            # Create session
            async with self.session.post(f"{BACKEND_URL}/session") as response:
                data = await response.json()
                session_id = data["session_id"]
            
            # Add people
            people_data = {
                "people": [
                    {"name": "Continuity Scout", "option1": "Tropa", "option2": "Esculta", "veto": "Colonia"},
                    {"name": "Regular Scout", "option1": "Manada", "option2": "Colonia", "veto": "Clan"}
                ],
                "session_id": session_id
            }
            await self.session.post(f"{BACKEND_URL}/people", json=people_data)
            
            # Set limits
            limits_data = {
                "limits": {
                    "Colonia": {"min": 0, "max": 2},
                    "Manada": {"min": 0, "max": 2},
                    "Tropa": {"min": 0, "max": 2},
                    "Esculta": {"min": 0, "max": 2},
                    "Clan": {"min": 0, "max": 2}
                }
            }
            await self.session.post(f"{BACKEND_URL}/limits?session_id={session_id}", json=limits_data)
            
            # Set continuity list (force Continuity Scout to Manada, against their preference)
            continuity_data = {
                "continuity_list": [
                    {"name": "Continuity Scout", "section": "Manada"}
                ],
                "session_id": session_id
            }
            await self.session.post(f"{BACKEND_URL}/continuity", json=continuity_data)
            
            # Execute assignment
            assignment_request = {"session_id": session_id}
            async with self.session.post(f"{BACKEND_URL}/assign", json=assignment_request) as response:
                if response.status == 200:
                    data = await response.json()
                    assignment = data["assignment"]
                    assignments = assignment["assignments"]
                    
                    # Check that Continuity Scout is in Manada (not their first choice Tropa)
                    manada_scouts = [scout["name"] for scout in assignments.get("Manada", [])]
                    
                    if "Continuity Scout" in manada_scouts:
                        self.log_test("Continuity Priority", True, "Continuity list correctly overrides preferences")
                        success = True
                    else:
                        self.log_test("Continuity Priority", False, "Continuity list not respected")
                        success = False
                else:
                    self.log_test("Continuity Priority", False, f"Assignment failed with status: {response.status}")
                    success = False
            
            # Cleanup
            await self.session.delete(f"{BACKEND_URL}/session/{session_id}")
            return success
            
        except Exception as e:
            self.log_test("Continuity Priority", False, f"Error: {str(e)}")
            return False
    
    async def test_invalid_move_request(self):
        """Test error handling for invalid person move requests"""
        try:
            # Create session and basic setup
            async with self.session.post(f"{BACKEND_URL}/session") as response:
                data = await response.json()
                session_id = data["session_id"]
            
            people_data = {
                "people": [{"name": "Test Scout", "option1": "Tropa", "option2": "Esculta", "veto": "Colonia"}],
                "session_id": session_id
            }
            await self.session.post(f"{BACKEND_URL}/people", json=people_data)
            
            limits_data = {
                "limits": {
                    "Colonia": {"min": 0, "max": 2},
                    "Manada": {"min": 0, "max": 2},
                    "Tropa": {"min": 0, "max": 2},
                    "Esculta": {"min": 0, "max": 2},
                    "Clan": {"min": 0, "max": 2}
                }
            }
            await self.session.post(f"{BACKEND_URL}/limits?session_id={session_id}", json=limits_data)
            
            # Execute assignment
            assignment_request = {"session_id": session_id}
            await self.session.post(f"{BACKEND_URL}/assign", json=assignment_request)
            
            # Try to move non-existent person
            move_request = {
                "person_name": "Non-existent Scout",
                "from_section": "Tropa",
                "to_section": "Esculta"
            }
            
            async with self.session.post(f"{BACKEND_URL}/assignments/{session_id}/move", 
                                       json=move_request) as response:
                if response.status == 404:
                    self.log_test("Invalid Move Request", True, "Correctly rejects move of non-existent person")
                    success = True
                else:
                    self.log_test("Invalid Move Request", False, f"Should reject invalid move, got status: {response.status}")
                    success = False
            
            # Cleanup
            await self.session.delete(f"{BACKEND_URL}/session/{session_id}")
            return success
            
        except Exception as e:
            self.log_test("Invalid Move Request", False, f"Error: {str(e)}")
            return False
    
    async def run_edge_case_tests(self):
        """Run all edge case tests"""
        print("🧪 Running Edge Case Tests for Scout Section Organizer")
        print("=" * 60)
        
        tests = [
            ("Assignment Without Limits", self.test_assignment_with_no_limits),
            ("Conflicting Preferences", self.test_assignment_with_conflicting_preferences),
            ("Continuity Priority", self.test_continuity_priority),
            ("Invalid Move Request", self.test_invalid_move_request)
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
        print(f"📊 EDGE CASE TEST SUMMARY")
        print(f"✅ Passed: {passed}")
        print(f"❌ Failed: {failed}")
        print(f"📈 Success Rate: {(passed/(passed+failed)*100):.1f}%")
        
        return failed == 0

async def main():
    """Main test runner"""
    async with EdgeCaseTester() as tester:
        success = await tester.run_edge_case_tests()
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