export interface TeamMember {
  name: string;
  role: string;
  avatar: string;
  linkedin?: string;
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  targetAmount: number;
  completed: boolean;
  date: string;
}

export interface Project {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  howItWorks?: string;
  category: "AI/ML" | "DeFi" | "EdTech" | "HealthTech" | "GreenTech" | "SaaS";
  emoji?: string;
  coverImage: string;
  raised: number;
  goal: number;
  backers: number;
  daysLeft: number;
  team: TeamMember[];
  milestones: Milestone[];
  pitchDeckUrl?: string;
  createdAt: string;
  owner: string;
  tags: string[];
  featured?: boolean;
}

export interface Investment {
  projectId: string;
  projectName: string;
  amount: number;
  date: string;
  status: "active" | "completed" | "refunded";
}

export interface WalletState {
  address: string | null;
  balance: number;
  investments: Investment[];
  isConnected: boolean;
}
