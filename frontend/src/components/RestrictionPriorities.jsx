import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';
import { AlertTriangle } from 'lucide-react';

const RestrictionPriorities = ({ priorities, setPriorities }) => {
  const restrictions = [
    { key: 'sectionLimits', label: 'Límites por Sección', description: 'Respeto a los intervalos mín-máx' },
    { key: 'continuityList', label: 'Lista de Continuidad', description: 'Personas fijas en secciones' },
    { key: 'firstPreference', label: 'Primera Preferencia', description: 'Opción 1 de cada persona' },
    { key: 'secondPreference', label: 'Segunda Preferencia', description: 'Opción 2 de cada persona' }
  ];

  const priorityLevels = [
    { value: 1, label: '1 - Máxima Prioridad' },
    { value: 2, label: '2 - Alta Prioridad' },
    { value: 3, label: '3 - Media Prioridad' },
    { value: 4, label: '4 - Baja Prioridad' }
  ];

  const updatePriority = (restrictionKey, priority) => {
    setPriorities(prev => ({
      ...prev,
      [restrictionKey]: parseInt(priority)
    }));
  };

  return (
    <Card className="bg-white border-gray-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-800">
          <AlertTriangle className="w-5 h-5" />
          Prioridades de Restricciones
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-3 bg-yellow-50 rounded-lg text-sm text-yellow-800">
          <strong>Configuración de prioridades:</strong> En caso de conflicto, las restricciones con prioridad 1 
          se aplicarán antes que las de prioridad 2, y así sucesivamente.
        </div>

        {restrictions.map(restriction => (
          <div key={restriction.key} className="p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
              <div>
                <Label className="font-medium text-gray-800">{restriction.label}</Label>
                <p className="text-sm text-gray-600 mt-1">{restriction.description}</p>
              </div>
              <div>
                <Select 
                  value={priorities[restriction.key]?.toString()} 
                  onValueChange={(value) => updatePriority(restriction.key, value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar prioridad" />
                  </SelectTrigger>
                  <SelectContent>
                    {priorityLevels.map(level => (
                      <SelectItem key={level.value} value={level.value.toString()}>
                        {level.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        ))}

        <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-800">
          <strong>Recomendación:</strong> Se sugiere mantener "Lista de Continuidad" y "Límites por Sección" 
          con máxima prioridad para garantizar el funcionamiento básico del sistema.
        </div>
      </CardContent>
    </Card>
  );
};

export default RestrictionPriorities;