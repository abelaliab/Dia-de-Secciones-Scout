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

// API Service
import sectionOrganizerAPI from "./services/api";

// Mock data for demo purposes
import { 
  mockPeople, 
  mockContinuityList, 
  mockLimits, 
  mockRestrictionPriorities
} from "./mock";

// Icons
import { Play, RotateCcw, Settings, Users, Target, Loader2 } from "lucide-react";

const Home = () => {
  // State management
  const [sessionId, setSessionId] = useState(null);
  const [people, setPeople] = useState([]);
  const [limits, setLimits] = useState(mockLimits);
  const [continuityList, setContinuityList] = useState([]);
  const [restrictionPriorities, setRestrictionPriorities] = useState(mockRestrictionPriorities);
  const [assignments, setAssignments] = useState(null);
  const [statistics, setStatistics] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Initialize session on component mount
  useEffect(() => {
    initializeSession();
  }, []);

  const initializeSession = async () => {
    setIsLoading(true);
    const result = await sectionOrganizerAPI.createSession();
    if (result.success) {
      setSessionId(result.data.session_id);
      toast({
        title: "Sesión iniciada",
        description: "Nueva sesión creada exitosamente."
      });
    } else {
      toast({
        title: "Error",
        description: "No se pudo crear la sesión: " + result.error,
        variant: "destructive"
      });
    }
    setIsLoading(false);
  };

  // Load mock data for demo
  const loadMockData = async () => {
    if (!sessionId) {
      toast({
        title: "Error",
        description: "No hay sesión activa",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Save people
      const peopleResult = await sectionOrganizerAPI.savePeople(mockPeople, sessionId);
      if (!peopleResult.success) throw new Error(peopleResult.error);

      // Save limits
      const limitsResult = await sectionOrganizerAPI.saveLimits(mockLimits, sessionId);
      if (!limitsResult.success) throw new Error(limitsResult.error);

      // Save continuity list
      const continuityResult = await sectionOrganizerAPI.saveContinuityList(mockContinuityList, sessionId);
      if (!continuityResult.success) throw new Error(continuityResult.error);

      // Save priorities
      const prioritiesResult = await sectionOrganizerAPI.savePriorities(mockRestrictionPriorities, sessionId);
      if (!prioritiesResult.success) throw new Error(prioritiesResult.error);

      // Update local state
      setPeople(mockPeople);
      setContinuityList(mockContinuityList);
      setLimits(mockLimits);
      setRestrictionPriorities(mockRestrictionPriorities);

      toast({
        title: "Datos de prueba cargados",
        description: "Se han cargado y guardado datos de ejemplo para probar la aplicación."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al cargar datos de prueba: " + error.message,
        variant: "destructive"
      });
    }
    
    setIsLoading(false);
  };

  // Save current configuration to backend
  const saveConfiguration = async () => {
    if (!sessionId) return;

    setIsLoading(true);
    
    try {
      await Promise.all([
        sectionOrganizerAPI.savePeople(people, sessionId),
        sectionOrganizerAPI.saveLimits(limits, sessionId),
        sectionOrganizerAPI.saveContinuityList(continuityList, sessionId),
        sectionOrganizerAPI.savePriorities(restrictionPriorities, sessionId)
      ]);

      toast({
        title: "Configuración guardada",
        description: "Todos los datos se han guardado correctamente."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al guardar configuración: " + error.message,
        variant: "destructive"
      });
    }

    setIsLoading(false);
  };

  // Run automatic assignment
  const runAssignment = async () => {
    if (!sessionId) {
      toast({
        title: "Error",
        description: "No hay sesión activa",
        variant: "destructive"
      });
      return;
    }

    if (people.length === 0) {
      toast({
        title: "Error",
        description: "Debe agregar al menos una persona para continuar.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      // Save current configuration first
      await saveConfiguration();
      
      // Execute assignment
      const result = await sectionOrganizerAPI.executeAssignment(sessionId);
      
      if (result.success) {
        const assignment = result.data.assignment;
        
        // Convert assignments to format expected by frontend
        const formattedAssignments = {};
        Object.keys(assignment.assignments).forEach(section => {
          formattedAssignments[section] = assignment.assignments[section] || [];
        });
        
        setAssignments(formattedAssignments);
        setStatistics(assignment.statistics);
        
        toast({
          title: "Asignación completada",
          description: `Se han asignado ${assignment.statistics.assigned} personas en las 5 secciones.`
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({
        title: "Error en asignación",
        description: error.message,
        variant: "destructive"
      });
    }
    
    setIsProcessing(false);
  };

  // Handle manual person movement between sections
  const handlePersonMove = async (person, fromSection, toSection) => {
    if (!sessionId || !assignments) return;
    
    try {
      const result = await sectionOrganizerAPI.movePerson(
        sessionId, 
        person.name, 
        fromSection, 
        toSection
      );
      
      if (result.success) {
        // Update local assignments state
        setAssignments(prev => {
          const newAssignments = { ...prev };
          
          // Remove from source section
          newAssignments[fromSection] = newAssignments[fromSection].filter(p => p.name !== person.name);
          
          // Add to target section
          newAssignments[toSection] = [...newAssignments[toSection], person];
          
          return newAssignments;
        });

        // Update statistics
        setStatistics(result.data.statistics);

        toast({
          title: "Persona movida",
          description: `${person.name} ha sido movido de ${fromSection} a ${toSection}.`
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al mover persona: " + error.message,
        variant: "destructive"
      });
    }
  };

  // Reset all data
  const resetAll = async () => {
    if (sessionId) {
      const result = await sectionOrganizerAPI.deleteSession(sessionId);
      if (!result.success) {
        toast({
          title: "Advertencia",
          description: "No se pudo eliminar la sesión anterior",
          variant: "destructive"
        });
      }
    }

    // Clear local state
    setPeople([]);
    setContinuityList([]);
    setLimits(mockLimits);
    setRestrictionPriorities(mockRestrictionPriorities);
    setAssignments(null);
    setStatistics(null);
    
    // Create new session
    await initializeSession();
    
    toast({
      title: "Datos reiniciados",
      description: "Todos los datos han sido limpiados y se ha creado una nueva sesión."
    });
  };

  if (isLoading && !sessionId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Inicializando sesión...</p>
        </div>
      </div>
    );
  }

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
          {sessionId && (
            <div className="mt-2">
              <Badge variant="outline" className="text-xs">
                Sesión: {sessionId.slice(0, 8)}...
              </Badge>
            </div>
          )}
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
                  <Button 
                    onClick={loadMockData} 
                    variant="outline"
                    disabled={isLoading || !sessionId}
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Users className="w-4 h-4 mr-2" />
                    )}
                    Cargar Datos de Prueba
                  </Button>
                  <Button 
                    onClick={runAssignment} 
                    disabled={isProcessing || people.length === 0 || !sessionId || isLoading}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {isProcessing ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Play className="w-4 h-4 mr-2" />
                    )}
                    {isProcessing ? "Procesando..." : "Ejecutar Asignación"}
                  </Button>
                  <Button 
                    onClick={resetAll} 
                    variant="destructive"
                    disabled={isLoading}
                  >
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