import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Plus, Trash2, Shield } from 'lucide-react';

const ContinuityList = ({ continuityList, setContinuityList }) => {
  const [newContinuity, setNewContinuity] = useState({
    name: '',
    section: ''
  });

  const sections = ['Colonia', 'Manada', 'Tropa', 'Esculta', 'Clan'];

  const addContinuity = () => {
    if (newContinuity.name && newContinuity.section) {
      setContinuityList([...continuityList, { ...newContinuity }]);
      setNewContinuity({ name: '', section: '' });
    }
  };

  const removeContinuity = (index) => {
    setContinuityList(continuityList.filter((_, i) => i !== index));
  };

  const sectionColors = {
    'Colonia': 'bg-blue-100 text-blue-800',
    'Manada': 'bg-yellow-100 text-yellow-800',
    'Tropa': 'bg-green-100 text-green-800',
    'Esculta': 'bg-amber-100 text-amber-800',
    'Clan': 'bg-red-100 text-red-800'
  };

  return (
    <Card className="bg-white border-gray-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-800">
          <Shield className="w-5 h-5" />
          Lista de Continuidad
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add new continuity */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 bg-gray-50 rounded-lg">
          <div>
            <Label htmlFor="continuity-name">Nombre</Label>
            <Input
              id="continuity-name"
              value={newContinuity.name}
              onChange={(e) => setNewContinuity({...newContinuity, name: e.target.value})}
              placeholder="Nombre de la persona"
            />
          </div>
          <div>
            <Label htmlFor="continuity-section">Sección Fija</Label>
            <Select value={newContinuity.section} onValueChange={(value) => setNewContinuity({...newContinuity, section: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar sección" />
              </SelectTrigger>
              <SelectContent>
                {sections.map(section => (
                  <SelectItem key={section} value={section}>{section}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <Button onClick={addContinuity} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Agregar
            </Button>
          </div>
        </div>

        {/* Continuity list */}
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {continuityList.length === 0 ? (
            <div className="text-center py-8 text-gray-500 italic">
              No hay personas en lista de continuidad
            </div>
          ) : (
            continuityList.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                <div className="flex items-center gap-3">
                  <Shield className="w-4 h-4 text-gray-500" />
                  <div>
                    <div className="font-medium">{item.name}</div>
                    <div className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${sectionColors[item.section]}`}>
                      {item.section}
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeContinuity(index)}
                  className="text-red-600 hover:text-red-800 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))
          )}
        </div>

        {continuityList.length > 0 && (
          <div className="text-sm text-gray-600 text-center">
            Total: {continuityList.length} personas fijas
          </div>
        )}

        <div className="mt-4 p-3 bg-green-50 rounded-lg text-sm text-green-800">
          <strong>Nota:</strong> Las personas en esta lista se mantendrán fijas en sus secciones asignadas 
          durante la asignación automática y no podrán ser movidas manualmente.
        </div>
      </CardContent>
    </Card>
  );
};

export default ContinuityList;