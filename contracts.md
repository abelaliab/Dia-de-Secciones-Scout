# Contratos de API - Organizador de Secciones

## 1. Datos Mock a Reemplazar

### Frontend Mock Data (mock.js):
- `mockPeople`: Lista de personas con preferencias
- `mockContinuityList`: Lista de continuidad 
- `mockLimits`: Límites por sección
- `mockRestrictionPriorities`: Prioridades de restricciones
- `mockAssignPeople()`: Algoritmo de asignación
- `mockGetStatistics()`: Cálculo de estadísticas

## 2. API Endpoints Necesarios

### Gestión de Personas
```
POST /api/people - Crear/actualizar lista de personas
GET /api/people - Obtener lista de personas
DELETE /api/people - Limpiar lista de personas
```

### Configuración de Límites
```
POST /api/limits - Guardar límites por sección
GET /api/limits - Obtener límites actuales
```

### Lista de Continuidad
```
POST /api/continuity - Guardar lista de continuidad
GET /api/continuity - Obtener lista de continuidad
```

### Prioridades de Restricciones
```
POST /api/priorities - Guardar prioridades
GET /api/priorities - Obtener prioridades
```

### Asignación Principal
```
POST /api/assign - Ejecutar algoritmo de asignación
GET /api/assignments/:sessionId - Obtener asignaciones por sesión
POST /api/assignments/:sessionId/move - Mover persona entre secciones
```

### Estadísticas
```
GET /api/statistics/:sessionId - Obtener estadísticas de asignación
```

## 3. Modelos de Base de Datos

### Person
```python
{
  "name": str,
  "option1": str,  # Primera preferencia
  "option2": str,  # Segunda preferencia  
  "veto": str,     # Sección vetada
  "session_id": str
}
```

### SectionLimits
```python
{
  "session_id": str,
  "limits": {
    "Colonia": {"min": int, "max": int},
    "Manada": {"min": int, "max": int},
    "Tropa": {"min": int, "max": int},
    "Esculta": {"min": int, "max": int},
    "Clan": {"min": int, "max": int}
  }
}
```

### ContinuityList
```python
{
  "name": str,
  "section": str,
  "session_id": str
}
```

### RestrictionPriorities
```python
{
  "session_id": str,
  "priorities": {
    "sectionLimits": int,
    "continuityList": int, 
    "firstPreference": int,
    "secondPreference": int
  }
}
```

### Assignment
```python
{
  "session_id": str,
  "assignments": {
    "Colonia": [person_objects],
    "Manada": [person_objects],
    "Tropa": [person_objects],
    "Esculta": [person_objects],
    "Clan": [person_objects]
  },
  "created_at": datetime,
  "statistics": {
    "totalPeople": int,
    "assigned": int,
    "satisfaction": {...},
    "sectionCounts": {...},
    "withinLimits": bool
  }
}
```

## 4. Algoritmo de Asignación

### Lógica Principal:
1. **Asignar lista de continuidad primero** (prioridad máxima)
2. **Aplicar restricciones según prioridades configuradas**:
   - Prioridad 1: Límites de sección + Lista de continuidad
   - Prioridad 2-4: Preferencias según configuración
3. **Estrategia de asignación**:
   - Intentar primera preferencia si hay espacio
   - Intentar segunda preferencia si hay espacio
   - Asignar a sección disponible (excluyendo veto)
   - Si no hay opciones, forzar a sección menos llena

### Manejo de Conflictos:
- Si límites tienen prioridad 1: respetar intervalos min-max
- Si preferencias tienen prioridad 1: asignar aleatoriamente cuando sección se llene
- Calcular satisfacción tras asignación

## 5. Integración Frontend-Backend

### Flujo de Datos:
1. **Configuración**: Frontend envía datos de configuración a endpoints respectivos
2. **Asignación**: Frontend llama `/api/assign` con session_id
3. **Resultados**: Backend devuelve asignaciones + estadísticas
4. **Movimiento manual**: Frontend llama `/api/assignments/:sessionId/move`
5. **Actualización**: Backend recalcula estadísticas tras cambios manuales

### Gestión de Sesiones:
- Cada configuración tendrá un `session_id` único
- Permite múltiples configuraciones simultáneas
- Facilita histórico de asignaciones

## 6. Cambios en Frontend

### Reemplazar en App.js:
- `mockAssignPeople()` → llamada a `/api/assign`
- `mockGetStatistics()` → llamada a `/api/statistics/:sessionId`
- `handlePersonMove()` → llamada a `/api/assignments/:sessionId/move`

### Agregar gestión de estados:
- Session ID para tracking
- Loading states para operaciones async
- Error handling para fallos de API

### Mantener funcionalidad existente:
- Drag & drop entre secciones
- Visualización de estadísticas en tiempo real
- Interfaz de configuración completa