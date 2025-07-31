import random
from typing import Dict, List, Tuple
from models import Person, SectionLimits, ContinuityItem, RestrictionPriorities, AssignmentStatistics, SatisfactionStats

class SectionAssigner:
    def __init__(self, people: List[Person], limits: SectionLimits, 
                 continuity_list: List[ContinuityItem], priorities: RestrictionPriorities):
        self.people = people
        self.limits = limits.limits
        self.continuity_list = continuity_list
        self.priorities = priorities.priorities
        self.sections = ["Colonia", "Manada", "Tropa", "Esculta", "Clan"]
        
    def assign_people(self) -> Dict[str, List[Person]]:
        """Main assignment algorithm"""
        # Initialize sections
        assignments = {section: [] for section in self.sections}
        
        # Step 1: Assign continuity list (highest priority)
        assigned_people = set()
        for continuity_item in self.continuity_list:
            person = self._find_person_by_name(continuity_item.name)
            if person and person.name not in assigned_people:
                assignments[continuity_item.section].append(person)
                assigned_people.add(person.name)
        
        # Step 2: Get remaining people
        remaining_people = [p for p in self.people if p.name not in assigned_people]
        
        # Step 3: Sort restrictions by priority
        restriction_order = sorted(self.priorities.items(), key=lambda x: x[1])
        
        # Step 4: Apply assignment strategy based on priorities
        if self._get_priority('sectionLimits') == 1:
            # Section limits have highest priority - strict limit enforcement
            assignments = self._assign_with_strict_limits(assignments, remaining_people)
        else:
            # Preferences have higher priority - try to satisfy preferences first
            assignments = self._assign_with_preference_priority(assignments, remaining_people)
            
        return assignments
    
    def _assign_with_strict_limits(self, assignments: Dict[str, List[Person]], 
                                 remaining_people: List[Person]) -> Dict[str, List[Person]]:
        """Assignment strategy when section limits have priority 1"""
        random.shuffle(remaining_people)  # Randomize for fairness
        
        for person in remaining_people:
            assigned = False
            
            # Try first preference
            if self._can_assign_to_section(assignments, person.option1):
                assignments[person.option1].append(person)
                assigned = True
            # Try second preference
            elif self._can_assign_to_section(assignments, person.option2):
                assignments[person.option2].append(person)
                assigned = True
            # Try any available section (excluding veto)
            else:
                for section in self.sections:
                    if (section != person.veto and 
                        self._can_assign_to_section(assignments, section)):
                        assignments[section].append(person)
                        assigned = True
                        break
            
            # If still not assigned, force assign to least full section
            if not assigned:
                least_full = min(self.sections, key=lambda s: len(assignments[s]))
                assignments[least_full].append(person)
                
        return assignments
    
    def _assign_with_preference_priority(self, assignments: Dict[str, List[Person]], 
                                       remaining_people: List[Person]) -> Dict[str, List[Person]]:
        """Assignment strategy when preferences have higher priority"""
        # Group people by first preference
        first_preference_groups = {}
        for person in remaining_people:
            if person.option1 not in first_preference_groups:
                first_preference_groups[person.option1] = []
            first_preference_groups[person.option1].append(person)
        
        # Assign by first preferences
        for section, people_wanting_section in first_preference_groups.items():
            available_spots = self.limits[section].max - len(assignments[section])
            
            if len(people_wanting_section) <= available_spots:
                # Everyone gets their first choice
                assignments[section].extend(people_wanting_section)
                remaining_people = [p for p in remaining_people if p not in people_wanting_section]
            else:
                # Random selection for first preference
                selected = random.sample(people_wanting_section, available_spots)
                assignments[section].extend(selected)
                remaining_people = [p for p in remaining_people if p not in selected]
        
        # Assign remaining people by second preference
        for person in remaining_people[:]:
            if self._can_assign_to_section(assignments, person.option2):
                assignments[person.option2].append(person)
                remaining_people.remove(person)
        
        # Assign remaining people to any available section
        for person in remaining_people:
            assigned = False
            for section in self.sections:
                if (section != person.veto and 
                    self._can_assign_to_section(assignments, section)):
                    assignments[section].append(person)
                    assigned = True
                    break
            
            # Force assign if necessary
            if not assigned:
                least_full = min(self.sections, key=lambda s: len(assignments[s]))
                assignments[least_full].append(person)
        
        return assignments
    
    def _can_assign_to_section(self, assignments: Dict[str, List[Person]], section: str) -> bool:
        """Check if we can assign another person to this section"""
        current_count = len(assignments[section])
        return current_count < self.limits[section].max
    
    def _find_person_by_name(self, name: str) -> Person:
        """Find person by name in the people list"""
        for person in self.people:
            if person.name == name:
                return person
        return None
    
    def _get_priority(self, restriction: str) -> int:
        """Get priority level for a restriction"""
        return self.priorities.get(restriction, 4)
    
    def calculate_statistics(self, assignments: Dict[str, List[Person]]) -> AssignmentStatistics:
        """Calculate assignment satisfaction statistics"""
        total_people = len(self.people)
        assigned = sum(len(section_people) for section_people in assignments.values())
        
        satisfaction = SatisfactionStats()
        section_counts = {}
        within_limits = True
        
        for section, section_people in assignments.items():
            section_counts[section] = len(section_people)
            
            # Check if within limits
            limit = self.limits[section]
            if len(section_people) < limit.min or len(section_people) > limit.max:
                within_limits = False
            
            # Calculate satisfaction
            for person in section_people:
                if person.option1 == section:
                    satisfaction.firstChoice += 1
                elif person.option2 == section:
                    satisfaction.secondChoice += 1
                elif person.veto == section:
                    satisfaction.veto += 1
                else:
                    satisfaction.other += 1
        
        return AssignmentStatistics(
            totalPeople=total_people,
            assigned=assigned,
            satisfaction=satisfaction,
            sectionCounts=section_counts,
            withinLimits=within_limits
        )