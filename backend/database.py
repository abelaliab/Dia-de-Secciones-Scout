from motor.motor_asyncio import AsyncIOMotorClient
from typing import List, Optional, Dict, Any
import os
from models import *

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

class Database:
    def __init__(self):
        self.sessions = db.sessions
        self.assignments = db.assignments
    
    # Session Management
    async def create_session(self, session_id: str) -> bool:
        """Create a new session"""
        session_data = SessionData(session_id=session_id)
        result = await self.sessions.insert_one(session_data.dict())
        return result.inserted_id is not None
    
    async def get_session(self, session_id: str) -> Optional[SessionData]:
        """Get session data"""
        session_doc = await self.sessions.find_one({"session_id": session_id})
        if session_doc:
            return SessionData(**session_doc)
        return None
    
    async def update_session(self, session_id: str, update_data: Dict[str, Any]) -> bool:
        """Update session data"""
        result = await self.sessions.update_one(
            {"session_id": session_id},
            {"$set": update_data}
        )
        return result.modified_count > 0
    
    # People Management
    async def save_people(self, session_id: str, people: List[PersonCreate]) -> bool:
        """Save people list for a session"""
        people_objects = [Person(**person.dict(), session_id=session_id) for person in people]
        people_dicts = [person.dict() for person in people_objects]
        
        await self.sessions.update_one(
            {"session_id": session_id},
            {"$set": {"people": people_dicts}},
            upsert=True
        )
        return True
    
    async def get_people(self, session_id: str) -> List[Person]:
        """Get people list for a session"""
        session = await self.get_session(session_id)
        if session and session.people:
            return session.people
        return []
    
    # Section Limits Management
    async def save_limits(self, session_id: str, limits: SectionLimitsCreate) -> bool:
        """Save section limits for a session"""
        limits_obj = SectionLimits(session_id=session_id, limits=limits.limits)
        await self.sessions.update_one(
            {"session_id": session_id},
            {"$set": {"limits": limits_obj.dict()}},
            upsert=True
        )
        return True
    
    async def get_limits(self, session_id: str) -> Optional[SectionLimits]:
        """Get section limits for a session"""
        session = await self.get_session(session_id)
        if session and session.limits:
            return session.limits
        return None
    
    # Continuity List Management
    async def save_continuity_list(self, session_id: str, continuity_list: List[ContinuityItemCreate]) -> bool:
        """Save continuity list for a session"""
        continuity_objects = [ContinuityItem(**item.dict(), session_id=session_id) for item in continuity_list]
        continuity_dicts = [item.dict() for item in continuity_objects]
        
        await self.sessions.update_one(
            {"session_id": session_id},
            {"$set": {"continuity_list": continuity_dicts}},
            upsert=True
        )
        return True
    
    async def get_continuity_list(self, session_id: str) -> List[ContinuityItem]:
        """Get continuity list for a session"""
        session = await self.get_session(session_id)
        if session and session.continuity_list:
            return session.continuity_list
        return []
    
    # Restriction Priorities Management
    async def save_priorities(self, session_id: str, priorities: RestrictionPrioritiesCreate) -> bool:
        """Save restriction priorities for a session"""
        priorities_obj = RestrictionPriorities(session_id=session_id, priorities=priorities.priorities)
        await self.sessions.update_one(
            {"session_id": session_id},
            {"$set": {"priorities": priorities_obj.dict()}},
            upsert=True
        )
        return True
    
    async def get_priorities(self, session_id: str) -> Optional[RestrictionPriorities]:
        """Get restriction priorities for a session"""
        session = await self.get_session(session_id)
        if session and session.priorities:
            return session.priorities
        return None
    
    # Assignment Management
    async def save_assignment(self, assignment: Assignment) -> bool:
        """Save assignment result"""
        # Save to assignments collection
        result = await self.assignments.insert_one(assignment.dict())
        
        # Update session with current assignment
        await self.sessions.update_one(
            {"session_id": assignment.session_id},
            {"$set": {"current_assignment": assignment.dict()}}
        )
        
        return result.inserted_id is not None
    
    async def get_assignment(self, session_id: str) -> Optional[Assignment]:
        """Get latest assignment for a session"""
        session = await self.get_session(session_id)
        if session and session.current_assignment:
            return Assignment(**session.current_assignment)
        return None
    
    async def update_assignment(self, session_id: str, assignments: Dict[str, List[Person]], 
                              statistics: AssignmentStatistics) -> bool:
        """Update assignment after manual changes"""
        session = await self.get_session(session_id)
        if not session or not session.current_assignment:
            return False
        
        # Convert Person objects to dicts for MongoDB storage
        assignments_dict = {}
        for section, people in assignments.items():
            assignments_dict[section] = [person.dict() for person in people]
        
        # Update the assignment
        update_data = {
            "current_assignment.assignments": assignments_dict,
            "current_assignment.statistics": statistics.dict()
        }
        
        result = await self.sessions.update_one(
            {"session_id": session_id},
            {"$set": update_data}
        )
        
        return result.modified_count > 0
    
    # Utility Methods
    async def delete_session(self, session_id: str) -> bool:
        """Delete a session and all its data"""
        result = await self.sessions.delete_one({"session_id": session_id})
        await self.assignments.delete_many({"session_id": session_id})
        return result.deleted_count > 0
    
    async def get_all_sessions(self) -> List[str]:
        """Get all session IDs"""
        sessions = await self.sessions.find({}, {"session_id": 1}).to_list(length=None)
        return [session["session_id"] for session in sessions]

# Global database instance
database = Database()