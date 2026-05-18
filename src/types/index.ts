export type UserRole = "AGENT" | "MANAGER" | "ADMIN";

export type VisitStatus = "PLANIFIEE" | "EN_COURS" | "TERMINEE" | "ANNULEE";

export interface User {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  agencyId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  notes: string | null;
  agentId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Property {
  id: string;
  address: string;
  city: string;
  postalCode: string;
  type: string;
  surface: number | null;
  price: number | null;
  description: string | null;
  agentId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Visit {
  id: string;
  scheduledAt: Date;
  status: VisitStatus;
  notes: string | null;
  clientId: string;
  propertyId: string;
  agentId: string;
  client?: Client;
  property?: Property;
  agent?: User;
  createdAt: Date;
  updatedAt: Date;
}

export interface DashboardStats {
  totalVisits: number;
  visitsThisWeek: number;
  totalClients: number;
  newClientsThisMonth: number;
  completionRate: number;
}
