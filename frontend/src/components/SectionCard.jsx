import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Users, GripVertical } from 'lucide-react';

const SectionCard = ({ section, people, onPersonMove, minSize, maxSize }) => {
  const sectionColors = {
    'Colonia': { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800', badge: 'bg-blue-100' },
    'Manada': { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-800', badge: 'bg-yellow-100' },
    'Tropa': { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-800', badge: 'bg-green-100' },
    'Esculta': { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-800', badge: 'bg-amber-100' },
    'Clan': { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800', badge: 'bg-red-100' }
  };

  const colors = sectionColors[section] || sectionColors.Colonia;
  const currentSize = people.length;
  const isWithinRange = currentSize >= minSize && currentSize <= maxSize;

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const personData = JSON.parse(e.dataTransfer.getData('text/plain'));
    if (personData.fromSection !== section) {
      onPersonMove(personData.person, personData.fromSection, section);
    }
  };

  const handlePersonDragStart = (e, person) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({
      person,
      fromSection: section
    }));
  };

  return (
    <Card 
      className={`${colors.bg} ${colors.border} border-2 min-h-[300px] transition-all duration-200 hover:shadow-lg`}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <CardHeader className="pb-3">
        <CardTitle className={`${colors.text} flex items-center justify-between text-lg font-semibold`}>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            {section}
          </div>
          <Badge 
            variant="secondary" 
            className={`${colors.badge} ${colors.text} font-medium`}
          >
            {currentSize}/{minSize}-{maxSize}
          </Badge>
        </CardTitle>
        {!isWithinRange && (
          <div className="text-sm text-red-600 font-medium">
            ⚠️ Fuera de rango ({minSize}-{maxSize})
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-2">
        {people.length === 0 ? (
          <div className="text-gray-500 text-center py-8 italic">
            Arrastra personas aquí
          </div>
        ) : (
          people.map((person, index) => (
            <div
              key={index}
              draggable
              onDragStart={(e) => handlePersonDragStart(e, person)}
              className={`${colors.badge} ${colors.text} p-3 rounded-lg cursor-move hover:opacity-80 transition-opacity flex items-center gap-2 border border-gray-200`}
            >
              <GripVertical className="w-4 h-4 text-gray-400" />
              <div className="flex-1">
                <div className="font-medium">{person.name}</div>
                <div className="text-xs opacity-75">
                  1ª: {person.option1} | 2ª: {person.option2} | Veto: {person.veto}
                </div>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};

export default SectionCard;