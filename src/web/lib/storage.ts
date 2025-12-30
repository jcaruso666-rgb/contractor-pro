// Local Storage Management for Contractor App
import { Client, Project, PricingData, DEFAULT_PRICING } from './types';

const STORAGE_KEYS = {
  CLIENTS: 'contractor_clients',
  PROJECTS: 'contractor_projects',
  PRICING: 'contractor_pricing',
  COMPANY: 'contractor_company',
  SETTINGS: 'contractor_settings',
} as const;

export interface CompanyInfo {
  name: string;
  address: string;
  phone: string;
  email: string;
  license: string;
  logo?: string;
}

// Clients
export const getClients = (): Client[] => {
  const data = localStorage.getItem(STORAGE_KEYS.CLIENTS);
  return data ? JSON.parse(data) : [];
};

export const saveClient = (client: Client) => {
  const clients = getClients();
  const existing = clients.findIndex(c => c.id === client.id);
  if (existing >= 0) {
    clients[existing] = client;
  } else {
    clients.push(client);
  }
  localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(clients));
};

export const deleteClient = (id: string) => {
  const clients = getClients().filter(c => c.id !== id);
  localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(clients));
};

// Projects
export const getProjects = (): Project[] => {
  const data = localStorage.getItem(STORAGE_KEYS.PROJECTS);
  return data ? JSON.parse(data) : [];
};

export const saveProject = (project: Project) => {
  const projects = getProjects();
  const existing = projects.findIndex(p => p.id === project.id);
  if (existing >= 0) {
    projects[existing] = project;
  } else {
    projects.push(project);
  }
  localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
};

export const deleteProject = (id: string) => {
  const projects = getProjects().filter(p => p.id !== id);
  localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
};

// Pricing
export const getPricing = (): PricingData => {
  const data = localStorage.getItem(STORAGE_KEYS.PRICING);
  return data ? JSON.parse(data) : DEFAULT_PRICING;
};

export const savePricing = (pricing: PricingData) => {
  localStorage.setItem(STORAGE_KEYS.PRICING, JSON.stringify(pricing));
};

// Company Info
export const getCompanyInfo = (): CompanyInfo => {
  const data = localStorage.getItem(STORAGE_KEYS.COMPANY);
  return data ? JSON.parse(data) : {
    name: 'Your Company Name',
    address: '',
    phone: '',
    email: '',
    license: '',
  };
};

export const saveCompanyInfo = (info: CompanyInfo) => {
  localStorage.setItem(STORAGE_KEYS.COMPANY, JSON.stringify(info));
};

// Export/Import
export const exportAllData = () => {
  return JSON.stringify({
    clients: getClients(),
    projects: getProjects(),
    pricing: getPricing(),
    company: getCompanyInfo(),
    exportedAt: new Date().toISOString(),
  }, null, 2);
};

export const importAllData = (jsonString: string) => {
  const data = JSON.parse(jsonString);
  if (data.clients) localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(data.clients));
  if (data.projects) localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(data.projects));
  if (data.pricing) localStorage.setItem(STORAGE_KEYS.PRICING, JSON.stringify(data.pricing));
  if (data.company) localStorage.setItem(STORAGE_KEYS.COMPANY, JSON.stringify(data.company));
};

// Settings
export interface AISettings {
  enabled: boolean;
  estimationStyle: 'Conservative' | 'Standard' | 'Comprehensive';
  typicalHomeAge: string;
  commonMaterials: string;
  climateNotes: string;
  marketNotes: string;
}

export interface AppSettings {
  aiSettings: AISettings;
}

export const getSettings = (): AppSettings => {
  const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
  return data ? JSON.parse(data) : {
    aiSettings: {
      enabled: true,
      estimationStyle: 'Standard',
      typicalHomeAge: '',
      commonMaterials: '',
      climateNotes: '',
      marketNotes: '',
    },
  };
};

export const saveSettings = (settings: AppSettings) => {
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
};

// Generate unique ID
export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};
