import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { BarChart3, Users, Target, AlertCircle } from 'lucide-react';

const AssignmentStats = ({ stats }) => {
  if (!stats) return null;

  const satisfactionPercentage = {
    firstChoice: Math.round((stats.satisfaction.firstChoice / stats.totalPeople) * 100),
    secondChoice: Math.round((stats.satisfaction.secondChoice / stats.totalPeople) * 100),
    other: Math.round((stats.satisfaction.other / stats.totalPeople) * 100),
    veto: Math.round((stats.satisfaction.veto / stats.totalPeople) * 100)
  };

  return (
    <Card className="bg-white border-gray-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-800">
          <BarChart3 className="w-5 h-5" />
          Estadísticas de Asignación
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <Users className="w-6 h-6 mx-auto text-blue-600 mb-2" />
            <div className="text-2xl font-bold text-blue-800">{stats.totalPeople}</div>
            <div className="text-sm text-blue-600">Total Personas</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <Target className="w-6 h-6 mx-auto text-green-600 mb-2" />
            <div className="text-2xl font-bold text-green-800">{stats.assigned}</div>
            <div className="text-sm text-green-600">Asignadas</div>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-800">{satisfactionPercentage.firstChoice}%</div>
            <div className="text-sm text-purple-600">1ª Opción</div>
          </div>
          <div className={`text-center p-3 rounded-lg ${stats.withinLimits ? 'bg-green-50' : 'bg-red-50'}`}>
            <AlertCircle className={`w-6 h-6 mx-auto mb-2 ${stats.withinLimits ? 'text-green-600' : 'text-red-600'}`} />
            <div className={`text-sm ${stats.withinLimits ? 'text-green-600' : 'text-red-600'}`}>
              {stats.withinLimits ? 'En Límites' : 'Fuera Límites'}
            </div>
          </div>
        </div>

        {/* Satisfaction breakdown */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-800">Nivel de Satisfacción</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Primera opción</span>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  {stats.satisfaction.firstChoice} personas ({satisfactionPercentage.firstChoice}%)
                </Badge>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Segunda opción</span>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                  {stats.satisfaction.secondChoice} personas ({satisfactionPercentage.secondChoice}%)
                </Badge>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Otra sección</span>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-gray-100 text-gray-800">
                  {stats.satisfaction.other} personas ({satisfactionPercentage.other}%)
                </Badge>
              </div>
            </div>
            {stats.satisfaction.veto > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Sección vetada</span>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-red-100 text-red-800">
                    {stats.satisfaction.veto} personas ({satisfactionPercentage.veto}%)
                  </Badge>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Section counts */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-800">Distribución por Sección</h4>
          <div className="grid grid-cols-5 gap-2">
            {Object.entries(stats.sectionCounts).map(([section, count]) => (
              <div key={section} className="text-center p-2 bg-gray-50 rounded-lg">
                <div className="text-lg font-bold text-gray-800">{count}</div>
                <div className="text-xs text-gray-600">{section}</div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AssignmentStats;