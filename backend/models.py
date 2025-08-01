from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any
from datetime import datetime
import uuid

# Section types
SECTIONS = ["Colonia", "Manada", "Tropa", "Esculta", "Clan"]
VETO_OPTIONS = SECTIONS + ["Ninguna"]

class Person(BaseModel):
    name: str
    option1: str  # Primera preferencia
    option2: str  # Segunda preferencia
    veto: str     # Sección vetada
    session_id: str = Field(default_factory=lambda: str(uuid.uuid4()))

class PersonCreate(BaseModel):
    name: str
    option1: str
    option2: str
    veto: str

class PersonList(BaseModel):
    people: List[PersonCreate]
    session_id: Optional[str] = None

class SectionLimit(BaseModel):
    min: int = Field(ge=0)
    max: int = Field(ge=1)

class SectionLimits(BaseModel):
    session_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    limits: Dict[str, SectionLimit]

class SectionLimitsCreate(BaseModel):
    limits: Dict[str, SectionLimit]

class ContinuityItem(BaseModel):
    name: str
    section: str
    session_id: str = Field(default_factory=lambda: str(uuid.uuid4()))

class ContinuityItemCreate(BaseModel):
    name: str
    section: str

class ContinuityList(BaseModel):
    continuity_list: List[ContinuityItemCreate]
    session_id: Optional[str] = None

class RestrictionPriorities(BaseModel):
    session_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    priorities: Dict[str, int] = {
        "sectionLimits": 1,
        "continuityList": 1,
        "firstPreference": 2,
        "secondPreference": 3
    }

class RestrictionPrioritiesCreate(BaseModel):
    priorities: Dict[str, int]

class SatisfactionStats(BaseModel):
    firstChoice: int = 0
    secondChoice: int = 0
    other: int = 0
    veto: int = 0

class AssignmentStatistics(BaseModel):
    totalPeople: int
    assigned: int
    satisfaction: SatisfactionStats
    sectionCounts: Dict[str, int]
    withinLimits: bool

class Assignment(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    session_id: str
    assignments: Dict[str, List[Person]]
    created_at: datetime = Field(default_factory=datetime.utcnow)
    statistics: AssignmentStatistics

class AssignmentRequest(BaseModel):
    session_id: str

class PersonMoveRequest(BaseModel):
    person_name: str
    from_section: str
    to_section: str

class SessionData(BaseModel):
    session_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    people: List[Person] = []
    limits: Optional[SectionLimits] = None
    continuity_list: List[ContinuityItem] = []
    priorities: Optional[RestrictionPriorities] = None
    current_assignment: Optional[Assignment] = None

class AssignmentResponse(BaseModel):
    success: bool
    session_id: str
    assignment: Assignment
    message: str = "Asignación completada exitosamente"