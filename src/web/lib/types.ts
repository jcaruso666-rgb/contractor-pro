// Contractor App Types

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  notes: string;
  createdAt: string;
}

export interface PropertyData {
  address: string;
  lat: number;
  lng: number;
  lotSize?: number;
  buildingArea?: number;
  roofArea?: number;
  perimeter?: number;
  yearBuilt?: number;
  propertyType?: string;
}

export interface Project {
  id: string;
  clientId: string;
  clientName: string;
  propertyAddress: string;
  propertyData?: PropertyData;
  status: 'quote' | 'approved' | 'in_progress' | 'completed';
  categories: ProjectCategory[];
  subtotal: number;
  tax: number;
  total: number;
  createdAt: string;
  updatedAt: string;
  notes: string;
}

export interface ProjectCategory {
  type: CategoryType;
  items: CalculatorResult[];
  subtotal: number;
  // AI-generated fields
  confidence?: 'high' | 'medium' | 'low';
  reasoning?: string;
}

export type CategoryType = 
  | 'roofing'
  | 'windows'
  | 'gutters'
  | 'siding'
  | 'doors'
  | 'painting'
  | 'concrete'
  | 'fencing';

export interface CalculatorResult {
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  total: number;
  laborHours: number;
  laborRate: number;
  laborCost: number;
}

export interface PricingData {
  roofing: {
    shingles: { min: number; max: number; default: number };
    metal: { min: number; max: number; default: number };
    tile: { min: number; max: number; default: number };
    laborRate: number;
  };
  windows: {
    singleHung: { min: number; max: number; default: number };
    doubleHung: { min: number; max: number; default: number };
    casement: { min: number; max: number; default: number };
    sliding: { min: number; max: number; default: number };
    laborRate: number;
    installationHours: number;
  };
  gutters: {
    aluminum: { min: number; max: number; default: number };
    copper: { min: number; max: number; default: number };
    vinyl: { min: number; max: number; default: number };
    downspout: number;
    corner: number;
    laborRate: number;
  };
  siding: {
    vinyl: { min: number; max: number; default: number };
    fiberCement: { min: number; max: number; default: number };
    wood: { min: number; max: number; default: number };
    jChannel: number;
    corner: number;
    laborRate: number;
  };
  doors: {
    exterior: { min: number; max: number; default: number };
    interior: { min: number; max: number; default: number };
    hardware: number;
    laborRate: number;
    installationHours: number;
  };
  painting: {
    interior: { min: number; max: number; default: number };
    exterior: { min: number; max: number; default: number };
    primer: number;
    laborRate: number;
    sqftPerGallon: number;
  };
  concrete: {
    perCubicYard: { min: number; max: number; default: number };
    laborRate: number;
  };
  fencing: {
    wood: { min: number; max: number; default: number };
    vinyl: { min: number; max: number; default: number };
    chainLink: { min: number; max: number; default: number };
    aluminum: { min: number; max: number; default: number };
    post: number;
    gate: number;
    laborRate: number;
  };
}

export const DEFAULT_PRICING: PricingData = {
  roofing: {
    shingles: { min: 80, max: 150, default: 115 },
    metal: { min: 300, max: 600, default: 450 },
    tile: { min: 400, max: 800, default: 600 },
    laborRate: 55,
  },
  windows: {
    singleHung: { min: 300, max: 600, default: 450 },
    doubleHung: { min: 400, max: 800, default: 600 },
    casement: { min: 500, max: 1000, default: 750 },
    sliding: { min: 350, max: 700, default: 525 },
    laborRate: 60,
    installationHours: 2,
  },
  gutters: {
    aluminum: { min: 4, max: 8, default: 6 },
    copper: { min: 25, max: 40, default: 32 },
    vinyl: { min: 3, max: 6, default: 4.5 },
    downspout: 45,
    corner: 15,
    laborRate: 45,
  },
  siding: {
    vinyl: { min: 3, max: 8, default: 5.5 },
    fiberCement: { min: 6, max: 12, default: 9 },
    wood: { min: 8, max: 15, default: 11.5 },
    jChannel: 2,
    corner: 25,
    laborRate: 50,
  },
  doors: {
    exterior: { min: 800, max: 3000, default: 1500 },
    interior: { min: 150, max: 600, default: 350 },
    hardware: 75,
    laborRate: 55,
    installationHours: 3,
  },
  painting: {
    interior: { min: 25, max: 50, default: 35 },
    exterior: { min: 35, max: 60, default: 45 },
    primer: 30,
    laborRate: 40,
    sqftPerGallon: 350,
  },
  concrete: {
    perCubicYard: { min: 100, max: 150, default: 125 },
    laborRate: 60,
  },
  fencing: {
    wood: { min: 15, max: 35, default: 25 },
    vinyl: { min: 20, max: 40, default: 30 },
    chainLink: { min: 10, max: 25, default: 17 },
    aluminum: { min: 25, max: 50, default: 37 },
    post: 35,
    gate: 250,
    laborRate: 45,
  },
};
