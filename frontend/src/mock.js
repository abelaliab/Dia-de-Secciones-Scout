// Mock data and functions for the section organizer

export const mockPeople = [
  { name: "Ana García", option1: "Colonia", option2: "Manada", veto: "Clan" },
  { name: "Carlos López", option1: "Tropa", option2: "Esculta", veto: "Colonia" },
  { name: "María Rodríguez", option1: "Manada", option2: "Colonia", veto: "Tropa" },
  { name: "Pedro Martín", option1: "Esculta", option2: "Clan", veto: "Manada" },
  { name: "Laura Sánchez", option1: "Clan", option2: "Tropa", veto: "Esculta" },
  { name: "Diego Fernández", option1: "Colonia", option2: "Manada", veto: "Clan" },
  { name: "Isabel Torres", option1: "Manada", option2: "Tropa", veto: "Colonia" },
  { name: "Miguel Ruiz", option1: "Tropa", option2: "Esculta", veto: "Manada" },
  { name: "Carmen Jiménez", option1: "Esculta", option2: "Clan", veto: "Tropa" },
  { name: "Antonio Morales", option1: "Clan", option2: "Colonia", veto: "Esculta" },
  { name: "Lucía Herrera", option1: "Colonia", option2: "Tropa", veto: "Manada" },
  { name: "Roberto Castro", option1: "Manada", option2: "Esculta", veto: "Clan" }
];

export const mockContinuityList = [
  { name: "Jefe Principal", section: "Esculta" },
  { name: "Coordinador Manada", section: "Manada" }
];

export const mockLimits = {
  Colonia: { min: 2, max: 4 },
  Manada: { min: 2, max: 4 },
  Tropa: { min: 2, max: 4 },
  Esculta: { min: 1, max: 3 },
  Clan: { min: 1, max: 3 }
};

export const mockRestrictionPriorities = {
  sectionLimits: 1,
  firstPreference: 2,
  secondPreference: 3,
  continuityList: 1
};

// Mock assignment algorithm
export const mockAssignPeople = (people, limits, continuityList, priorities) => {
  const sections = {
    Colonia: [],
    Manada: [],
    Tropa: [],
    Esculta: [],
    Clan: []
  };

  // First, assign continuity list people
  continuityList.forEach(item => {
    const person = people.find(p => p.name === item.name);
    if (person) {
      sections[item.section].push(person);
    }
  });

  // Get remaining people (not in continuity list)
  const remainingPeople = people.filter(person => 
    !continuityList.some(item => item.name === person.name)
  );

  // Simple mock algorithm: try to assign by first preference, then second, then randomly
  remainingPeople.forEach(person => {
    const { option1, option2, veto } = person;
    
    // Try first preference
    if (sections[option1].length < limits[option1].max) {
      sections[option1].push(person);
      return;
    }
    
    // Try second preference
    if (sections[option2].length < limits[option2].max) {
      sections[option2].push(person);
      return;
    }
    
    // Find any available section (excluding veto)
    const availableSections = Object.keys(sections).filter(section => 
      section !== veto && sections[section].length < limits[section].max
    );
    
    if (availableSections.length > 0) {
      const randomSection = availableSections[Math.floor(Math.random() * availableSections.length)];
      sections[randomSection].push(person);
    } else {
      // Force assign to least full section if no options available
      const leastFull = Object.keys(sections).reduce((a, b) => 
        sections[a].length < sections[b].length ? a : b
      );
      sections[leastFull].push(person);
    }
  });

  return sections;
};

// Mock statistics
export const mockGetStatistics = (assignments, people, limits) => {
  const stats = {
    totalPeople: people.length,
    assigned: 0,
    satisfaction: {
      firstChoice: 0,
      secondChoice: 0,
      other: 0,
      veto: 0
    },
    sectionCounts: {},
    withinLimits: true
  };

  Object.keys(assignments).forEach(section => {
    const sectionPeople = assignments[section];
    stats.assigned += sectionPeople.length;
    stats.sectionCounts[section] = sectionPeople.length;
    
    // Check if within limits
    const limit = limits[section];
    if (sectionPeople.length < limit.min || sectionPeople.length > limit.max) {
      stats.withinLimits = false;
    }
    
    // Calculate satisfaction
    sectionPeople.forEach(person => {
      if (person.option1 === section) {
        stats.satisfaction.firstChoice++;
      } else if (person.option2 === section) {
        stats.satisfaction.secondChoice++;
      } else if (person.veto === section) {
        stats.satisfaction.veto++;
      } else {
        stats.satisfaction.other++;
      }
    });
  });

  return stats;
};