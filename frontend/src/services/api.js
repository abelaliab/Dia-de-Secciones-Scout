import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API_BASE = `${BACKEND_URL}/api`;

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds
});

// API service class
class SectionOrganizerAPI {
  // Session Management
  async createSession() {
    try {
      const response = await api.post('/session');
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.detail || error.message };
    }
  }

  async getAllSessions() {
    try {
      const response = await api.get('/sessions');
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.detail || error.message };
    }
  }

  async deleteSession(sessionId) {
    try {
      const response = await api.delete(`/session/${sessionId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.detail || error.message };
    }
  }

  // People Management
  async savePeople(people, sessionId = null) {
    try {
      const payload = {
        people: people,
        session_id: sessionId
      };
      const response = await api.post('/people', payload);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.detail || error.message };
    }
  }

  async getPeople(sessionId) {
    try {
      const response = await api.get(`/people/${sessionId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.detail || error.message };
    }
  }

  // Section Limits Management
  async saveLimits(limits, sessionId = null) {
    const url = sessionId ? `/limits?session_id=${sessionId}` : '/limits';
    try {
      const payload = { limits };
      const response = await api.post(url, payload);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.detail || error.message };
    }
  }

  async getLimits(sessionId) {
    try {
      const response = await api.get(`/limits/${sessionId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.detail || error.message };
    }
  }

  // Continuity List Management
  async saveContinuityList(continuityList, sessionId = null) {
    try {
      const payload = {
        continuity_list: continuityList,
        session_id: sessionId
      };
      const response = await api.post('/continuity', payload);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.detail || error.message };
    }
  }

  async getContinuityList(sessionId) {
    try {
      const response = await api.get(`/continuity/${sessionId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.detail || error.message };
    }
  }

  // Restriction Priorities Management
  async savePriorities(priorities, sessionId = null) {
    const url = sessionId ? `/priorities?session_id=${sessionId}` : '/priorities';
    try {
      const payload = { priorities };
      const response = await api.post(url, payload);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.detail || error.message };
    }
  }

  async getPriorities(sessionId) {
    try {
      const response = await api.get(`/priorities/${sessionId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.detail || error.message };
    }
  }

  // Assignment Operations
  async executeAssignment(sessionId) {
    try {
      const payload = { session_id: sessionId };
      const response = await api.post('/assign', payload);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.detail || error.message };
    }
  }

  async getAssignment(sessionId) {
    try {
      const response = await api.get(`/assignments/${sessionId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.detail || error.message };
    }
  }

  async getStatistics(sessionId) {
    try {
      const response = await api.get(`/statistics/${sessionId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.detail || error.message };
    }
  }

  async movePerson(sessionId, personName, fromSection, toSection) {
    try {
      const payload = {
        person_name: personName,
        from_section: fromSection,
        to_section: toSection
      };
      const response = await api.post(`/assignments/${sessionId}/move`, payload);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.detail || error.message };
    }
  }

  // Utility Methods
  async healthCheck() {
    try {
      const response = await api.get('/');
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.detail || error.message };
    }
  }
}

// Create and export singleton instance
const sectionOrganizerAPI = new SectionOrganizerAPI();
export default sectionOrganizerAPI;