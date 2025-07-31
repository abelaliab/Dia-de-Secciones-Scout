from fastapi import FastAPI, APIRouter, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from pathlib import Path
import os
import logging
import uuid
from typing import List, Optional

# Import our models and services
from models import *
from database import database
from assignment_algorithm import SectionAssigner

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Create the main app
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Health check endpoint
@api_router.get("/")
async def root():
    return {"message": "Organizador de Secciones API"}

# Session Management
@api_router.post("/session")
async def create_session():
    """Create a new session"""
    session_id = str(uuid.uuid4())
    success = await database.create_session(session_id)
    if success:
        return {"session_id": session_id, "message": "Sesión creada exitosamente"}
    raise HTTPException(status_code=500, detail="Error al crear la sesión")

@api_router.get("/sessions")
async def get_all_sessions():
    """Get all session IDs"""
    sessions = await database.get_all_sessions()
    return {"sessions": sessions}

# People Management
@api_router.post("/people")
async def save_people(people_data: PersonList):
    """Save people list for a session"""
    session_id = people_data.session_id or str(uuid.uuid4())
    success = await database.save_people(session_id, people_data.people)
    if success:
        return {"session_id": session_id, "message": f"Lista de {len(people_data.people)} personas guardada"}
    raise HTTPException(status_code=500, detail="Error al guardar la lista de personas")

@api_router.get("/people/{session_id}")
async def get_people(session_id: str):
    """Get people list for a session"""
    people = await database.get_people(session_id)
    return {"people": [person.dict() for person in people]}

# Section Limits Management
@api_router.post("/limits")
async def save_limits(limits_data: SectionLimitsCreate, session_id: Optional[str] = None):
    """Save section limits for a session"""
    if not session_id:
        session_id = str(uuid.uuid4())
    success = await database.save_limits(session_id, limits_data)
    if success:
        return {"session_id": session_id, "message": "Límites por sección guardados"}
    raise HTTPException(status_code=500, detail="Error al guardar los límites")

@api_router.get("/limits/{session_id}")
async def get_limits(session_id: str):
    """Get section limits for a session"""
    limits = await database.get_limits(session_id)
    if limits:
        return limits.dict()
    raise HTTPException(status_code=404, detail="Límites no encontrados para esta sesión")

# Continuity List Management
@api_router.post("/continuity")
async def save_continuity_list(continuity_data: ContinuityList):
    """Save continuity list for a session"""
    session_id = continuity_data.session_id or str(uuid.uuid4())
    success = await database.save_continuity_list(session_id, continuity_data.continuity_list)
    if success:
        return {"session_id": session_id, "message": f"Lista de continuidad de {len(continuity_data.continuity_list)} personas guardada"}
    raise HTTPException(status_code=500, detail="Error al guardar la lista de continuidad")

@api_router.get("/continuity/{session_id}")
async def get_continuity_list(session_id: str):
    """Get continuity list for a session"""
    continuity_list = await database.get_continuity_list(session_id)
    return {"continuity_list": [item.dict() for item in continuity_list]}

# Restriction Priorities Management
@api_router.post("/priorities")
async def save_priorities(priorities_data: RestrictionPrioritiesCreate, session_id: Optional[str] = None):
    """Save restriction priorities for a session"""
    if not session_id:
        session_id = str(uuid.uuid4())
    success = await database.save_priorities(session_id, priorities_data)
    if success:
        return {"session_id": session_id, "message": "Prioridades de restricciones guardadas"}
    raise HTTPException(status_code=500, detail="Error al guardar las prioridades")

@api_router.get("/priorities/{session_id}")
async def get_priorities(session_id: str):
    """Get restriction priorities for a session"""
    priorities = await database.get_priorities(session_id)
    if priorities:
        return priorities.dict()
    raise HTTPException(status_code=404, detail="Prioridades no encontradas para esta sesión")

# Main Assignment Algorithm
@api_router.post("/assign", response_model=AssignmentResponse)
async def assign_people(request: AssignmentRequest):
    """Execute the assignment algorithm"""
    session_id = request.session_id
    
    # Get all required data
    people = await database.get_people(session_id)
    limits = await database.get_limits(session_id)
    continuity_list = await database.get_continuity_list(session_id)
    priorities = await database.get_priorities(session_id)
    
    # Validate required data
    if not people:
        raise HTTPException(status_code=400, detail="No hay personas registradas para esta sesión")
    if not limits:
        raise HTTPException(status_code=400, detail="No hay límites configurados para esta sesión")
    
    # Use default priorities if not set
    if not priorities:
        priorities = RestrictionPriorities(session_id=session_id)
    
    try:
        # Execute assignment algorithm
        assigner = SectionAssigner(people, limits, continuity_list, priorities)
        assignments = assigner.assign_people()
        statistics = assigner.calculate_statistics(assignments)
        
        # Create assignment object
        assignment = Assignment(
            session_id=session_id,
            assignments=assignments,
            statistics=statistics
        )
        
        # Save assignment
        success = await database.save_assignment(assignment)
        if not success:
            raise HTTPException(status_code=500, detail="Error al guardar la asignación")
        
        return AssignmentResponse(
            success=True,
            session_id=session_id,
            assignment=assignment
        )
        
    except Exception as e:
        logger.error(f"Error in assignment algorithm: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error en el algoritmo de asignación: {str(e)}")

# Assignment Results and Statistics
@api_router.get("/assignments/{session_id}")
async def get_assignment(session_id: str):
    """Get latest assignment for a session"""
    assignment = await database.get_assignment(session_id)
    if assignment:
        return assignment.dict()
    raise HTTPException(status_code=404, detail="No hay asignaciones para esta sesión")

@api_router.get("/statistics/{session_id}")
async def get_statistics(session_id: str):
    """Get assignment statistics for a session"""
    assignment = await database.get_assignment(session_id)
    if assignment:
        return assignment.statistics.dict()
    raise HTTPException(status_code=404, detail="No hay estadísticas para esta sesión")

# Manual Person Movement
@api_router.post("/assignments/{session_id}/move")
async def move_person(session_id: str, move_request: PersonMoveRequest):
    """Move a person between sections manually"""
    assignment = await database.get_assignment(session_id)
    if not assignment:
        raise HTTPException(status_code=404, detail="No hay asignaciones para esta sesión")
    
    # Find and move the person
    person_to_move = None
    assignments = assignment.assignments
    
    # Find person in from_section
    for person in assignments[move_request.from_section]:
        if person.name == move_request.person_name:
            person_to_move = person
            break
    
    if not person_to_move:
        raise HTTPException(status_code=404, detail="Persona no encontrada en la sección especificada")
    
    # Remove from source section
    assignments[move_request.from_section] = [
        p for p in assignments[move_request.from_section] 
        if p.name != move_request.person_name
    ]
    
    # Add to target section
    assignments[move_request.to_section].append(person_to_move)
    
    # Recalculate statistics
    people = await database.get_people(session_id)
    limits = await database.get_limits(session_id)
    continuity_list = await database.get_continuity_list(session_id)
    priorities = await database.get_priorities(session_id) or RestrictionPriorities(session_id=session_id)
    
    assigner = SectionAssigner(people, limits, continuity_list, priorities)
    new_statistics = assigner.calculate_statistics(assignments)
    
    # Update assignment in database
    success = await database.update_assignment(session_id, assignments, new_statistics)
    if success:
        return {
            "message": f"{move_request.person_name} movido de {move_request.from_section} a {move_request.to_section}",
            "statistics": new_statistics.dict()
        }
    
    raise HTTPException(status_code=500, detail="Error al actualizar la asignación")

# Session Cleanup
@api_router.delete("/session/{session_id}")
async def delete_session(session_id: str):
    """Delete a session and all its data"""
    success = await database.delete_session(session_id)
    if success:
        return {"message": "Sesión eliminada exitosamente"}
    raise HTTPException(status_code=404, detail="Sesión no encontrada")

# Include the router in the main app
app.include_router(api_router)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    """Close database connection on shutdown"""
    # Note: Motor handles connection pooling automatically
    pass