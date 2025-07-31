import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Settings } from 'lucide-react';

const SectionLimits = ({ limits, setLimits }) => {
  const sections = ['Colonia', 'Manada', 'Tropa', 'Esculta', 'Clan'];
  
  const sectionColors = {
    'Colonia': 'border-l-blue-500',
    'Manada': 'border-l-yellow-500',
    'Tropa': 'border-l-green-500',
    'Esculta': 'border-l-amber-500',
    'Clan': 'border-l-red-500'
  };

  const updateLimit = (section, field, value) => {
    const numValue = parseInt(value) || 0;
    setLimits(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: numValue
      }
    }));
  };

  return (
    <Card className="bg-white border-gray-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-800">
          <Settings className="w-5 h-5" />
          Límites por Sección
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {sections.map(section => (
          <div 
            key={section} 
            className={`p-4 bg-gray-50 rounded-lg border-l-4 ${sectionColors[section]}`}
          >
            <div className="font-medium text-gray-800 mb-3">{section}</div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor={`${section}-min`}>Mínimo</Label>
                <Input
                  id={`${section}-min`}
                  type="number"
                  min="0"
                  value={limits[section]?.min || 0}
                  onChange={(e) => updateLimit(section, 'min', e.target.value)}
                  placeholder="0"
                />
              </div>
              <div>
                <Label htmlFor={`${section}-max`}>Máximo</Label>
                <Input
                  id={`${section}-max`}
                  type="number"
                  min="0"
                  value={limits[section]?.max || 0}
                  onChange={(e) => updateLimit(section, 'max', e.target.value)}
                  placeholder="0"
                />
              </div>
            </div>
          </div>
        ))}
        
        <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-800">
          <strong>Nota:</strong> Los límites se aplicarán durante la asignación automática. 
          Puedes ajustar manualmente después usando drag & drop.
        </div>
      </CardContent>
    </Card>
  );
};

export default SectionLimits;