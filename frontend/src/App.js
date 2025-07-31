import React, { useState, useEffect } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Button } from "./components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { Badge } from "./components/ui/badge";
import { useToast } from "./hooks/use-toast";
import { Toaster } from "./components/ui/toaster";

// Components
import PersonInput from "./components/PersonInput";
import SectionLimits from "./components/SectionLimits";
import ContinuityList from "./components/ContinuityList";
import RestrictionPriorities from "./components/RestrictionPriorities";
import SectionCard from "./components/SectionCard";
import AssignmentStats from "./components/AssignmentStats";

// Mock data
import { 
  mockPeople, 
  mockContinuityList, 
  mockLimits, 
  mockRestrictionPriorities,
  mockAssignPeople,
  mockGetStatistics 
} from "./mock";

// Icons
import { Play, RotateCcw, Settings, Users, Target } from "lucide-react";

const Home = () => {
  const [people, setPeople] = useState([]);
  const [limits, setLimits] = useState(mockLimits);
  const [continuityList, setContinuityList] = useState([]);
  const [restrictionPriorities, setRestrictionPriorities] = useState(mockRestrictionPriorities);
  const [assignments, setAssignments] = useState(null);
  const [statistics, setStatistics] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  // Load mock data for demo
  const loadMockData = () => {
    setPeople(mockPeople);
    setContinuityList(mockContinuityList);
    toast({
      title: "Datos de prueba cargados",
      description: "Se han cargado datos de ejemplo para probar la aplicación."
    });
  };

  // Run automatic assignment
  const runAssignment = async () => {
    if (people.length === 0) {
      toast({
        title: "Error",
        description: "Debe agregar al menos una persona para continuar.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    
    // Simulate processing time
    setTimeout(() => {
      const result = mockAssignPeople(people, limits, continuityList, restrictionPriorities);
      const stats = mockGetStatistics(result, people, limits);
      
      setAssignments(result);
      setStatistics(stats);
      setIsProcessing(false);
      
      toast({
        title: "Asignación completada",
        description: `Se han asignado ${stats.assigned} personas en las 5 secciones.`
      });
    }, 2000);
  };

  // Handle manual person movement between sections
  const handlePersonMove = (person, fromSection, toSection) => {
    if (!assignments) return;
    
    setAssignments(prev => {
      const newAssignments = { ...prev };
      
      // Remove from source section
      newAssignments[fromSection] = newAssignments[fromSection].filter(p => p.name !== person.name);
      
      // Add to target section
      newAssignments[toSection] = [...newAssignments[toSection], person];
      
      return newAssignments;
    });

    // Update statistics
    if (assignments) {
      const newStats = mockGetStatistics(assignments, people, limits);
      setStatistics(newStats);
    }

    toast({
      title: "Persona movida",
      description: `${person.name} ha sido movido de ${fromSection} a ${toSection}.`
    });
  };

  // Reset all data
  const resetAll = () => {
    setPeople([]);
    setContinuityList([]);
    setLimits(mockLimits);
    setRestrictionPriorities(mockRestrictionPriorities);
    setAssignments(null);
    setStatistics(null);
    toast({
      title: "Datos reiniciados",
      description: "Todos los datos han sido limpiados."
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Organizador de Secciones
          </h1>
          <p className="text-lg text-gray-600">
            Sistema inteligente para distribuir personas en secciones scouts
          </p>
          <div className="flex justify-center gap-2 mt-4">
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">Colonia</Badge>
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Manada</Badge>
            <Badge variant="secondary" className="bg-green-100 text-green-800">Tropa</Badge>
            <Badge variant="secondary" className="bg-amber-100 text-amber-800">Esculta</Badge>
            <Badge variant="secondary" className="bg-red-100 text-red-800">Clan</Badge>
          </div>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="config" className="space-y-6">
          <TabsList className="grid grid-cols-2 w-full max-w-md mx-auto">
            <TabsTrigger value="config" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Configuración
            </TabsTrigger>
            <TabsTrigger value="results" className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              Resultados
            </TabsTrigger>
          </TabsList>

          <TabsContent value="config" className="space-y-6">
            {/* Control buttons */}
            <Card className="bg-white border-gray-200">
              <CardHeader>
                <CardTitle className="text-center text-gray-800">Acciones Rápidas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap justify-center gap-3">
                  <Button onClick={loadMockData} variant="outline">
                    <Users className="w-4 h-4 mr-2" />
                    Cargar Datos de Prueba
                  </Button>
                  <Button 
                    onClick={runAssignment} 
                    disabled={isProcessing || people.length === 0}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    {isProcessing ? "Procesando..." : "Ejecutar Asignación"}
                  </Button>
                  <Button onClick={resetAll} variant="destructive">
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reiniciar Todo
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Configuration panels */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-6">
                <PersonInput people={people} setPeople={setPeople} />
                <ContinuityList 
                  continuityList={continuityList} 
                  setContinuityList={setContinuityList} 
                />
              </div>
              <div className="space-y-6">
                <SectionLimits limits={limits} setLimits={setLimits} />
                <RestrictionPriorities 
                  priorities={restrictionPriorities} 
                  setPriorities={setRestrictionPriorities} 
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="results" className="space-y-6">
            {!assignments ? (
              <Card className="bg-white border-gray-200">
                <CardContent className="text-center py-12">
                  <Target className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">
                    No hay asignaciones aún
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Configura los datos y ejecuta la asignación automática para ver los resultados.
                  </p>
                  <Button 
                    onClick={() => document.querySelector('[value="config"]').click()}
                    variant="outline"
                  >
                    Ir a Configuración
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Statistics */}
                <AssignmentStats stats={statistics} />
                
                {/* Section cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                  {Object.entries(assignments).map(([section, sectionPeople]) => (
                    <SectionCard
                      key={section}
                      section={section}
                      people={sectionPeople}
                      onPersonMove={handlePersonMove}
                      minSize={limits[section]?.min || 0}
                      maxSize={limits[section]?.max || 999}
                    />
                  ))}
                </div>

                {/* Manual adjustment info */}
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="pt-6">
                    <div className="text-center text-blue-800">
                      <h4 className="font-semibold mb-2">Ajuste Manual</h4>
                      <p className="text-sm">
                        Puedes arrastrar y soltar personas entre secciones para hacer ajustes manuales. 
                        Las estadísticas se actualizarán automáticamente.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
      
      <Toaster />
    </div>
  );
};

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
