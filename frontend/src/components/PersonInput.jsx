import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Plus, Trash2, Users } from 'lucide-react';

const PersonInput = ({ people, setPeople }) => {
  const [newPerson, setNewPerson] = useState({
    name: '',
    option1: '',
    option2: '',
    veto: ''
  });

  const sections = ['Colonia', 'Manada', 'Tropa', 'Esculta', 'Clan'];

  const addPerson = () => {
    if (newPerson.name && newPerson.option1 && newPerson.option2 && newPerson.veto) {
      setPeople([...people, { ...newPerson }]);
      setNewPerson({ name: '', option1: '', option2: '', veto: '' });
    }
  };

  const removePerson = (index) => {
    setPeople(people.filter((_, i) => i !== index));
  };

  const handleBulkInput = (text) => {
    const lines = text.split('\n').filter(line => line.trim());
    const bulkPeople = lines.map(line => {
      const parts = line.split(',').map(p => p.trim());
      if (parts.length >= 4) {
        return {
          name: parts[0],
          option1: parts[1],
          option2: parts[2],
          veto: parts[3]
        };
      }
      return null;
    }).filter(Boolean);
    
    setPeople([...people, ...bulkPeople]);
  };

  return (
    <Card className="bg-white border-gray-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-800">
          <Users className="w-5 h-5" />
          Lista de Personas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add individual person */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 p-4 bg-gray-50 rounded-lg">
          <div>
            <Label htmlFor="name">Nombre</Label>
            <Input
              id="name"
              value={newPerson.name}
              onChange={(e) => setNewPerson({...newPerson, name: e.target.value})}
              placeholder="Nombre completo"
            />
          </div>
          <div>
            <Label htmlFor="option1">1ª Opción</Label>
            <Select value={newPerson.option1} onValueChange={(value) => setNewPerson({...newPerson, option1: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar" />
              </SelectTrigger>
              <SelectContent>
                {sections.map(section => (
                  <SelectItem key={section} value={section}>{section}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="option2">2ª Opción</Label>
            <Select value={newPerson.option2} onValueChange={(value) => setNewPerson({...newPerson, option2: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar" />
              </SelectTrigger>
              <SelectContent>
                {sections.map(section => (
                  <SelectItem key={section} value={section}>{section}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="veto">Veto</Label>
            <Select value={newPerson.veto} onValueChange={(value) => setNewPerson({...newPerson, veto: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar" />
              </SelectTrigger>
              <SelectContent>
                {sections.map(section => (
                  <SelectItem key={section} value={section}>{section}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <Button onClick={addPerson} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Agregar
            </Button>
          </div>
        </div>

        {/* Bulk input */}
        <div className="p-4 bg-blue-50 rounded-lg">
          <Label htmlFor="bulk">Entrada masiva (formato: Nombre, 1ª Opción, 2ª Opción, Veto)</Label>
          <textarea
            id="bulk"
            className="w-full mt-2 p-3 border border-gray-300 rounded-md resize-none"
            rows="4"
            placeholder="Juan Pérez, Colonia, Manada, Clan&#10;María García, Tropa, Esculta, Colonia"
            onBlur={(e) => {
              if (e.target.value.trim()) {
                handleBulkInput(e.target.value);
                e.target.value = '';
              }
            }}
          />
        </div>

        {/* People list */}
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {people.map((person, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <div className="font-medium">{person.name}</div>
                <div className="text-sm text-gray-600">
                  1ª: {person.option1} | 2ª: {person.option2} | Veto: {person.veto}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removePerson(index)}
                className="text-red-600 hover:text-red-800 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>

        {people.length > 0 && (
          <div className="text-sm text-gray-600 text-center">
            Total: {people.length} personas
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PersonInput;