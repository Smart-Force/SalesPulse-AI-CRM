export type View = 'Dashboard' | 'Email Inbox' | 'Prospects' | 'Campaigns' | 'Lead Generation' | 'Products' | 'Analytics' | 'Live Call' | 'Integrations' | 'Settings' | 'Workflows';

// FIX: Add 'Super Admin' to UserRole to resolve type errors in TeamSettings.tsx and RolesSettings.tsx.
export type UserRole = 'Super Admin' | 'Admin' | 'Manager' | 'Member';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarColor: string;
  initials: string;
  avatarUrl?: string;
}

export interface Template {
    id: string;
    name: string;
    subject: string;
    body: string;
}

export type ProspectStatus = 'New' | 'Contacted' | 'Engaged' | 'Meeting' | 'Closed';
export type ConfidenceScore = 'High' | 'Medium' | 'Low';

export interface ContactHistoryItem {
    date: string;
    type: 'Email' | 'Call' | 'Meeting';
    outcome: string;
    aiInsight: string;
    duration?: string;
}

export interface Prospect {
    id: string;
    name: string;
    initials: string;
    avatarColor: string;
    company: string;
    email: string;
    phone?: string;
    title?: string;
    status: ProspectStatus;
    lastContact: string;
    lastContactDate: Date;
    tags: string[];
    dealIds?: string[];
    isEnriched: boolean;
    confidenceScore: ConfidenceScore;
    decisionAuthorityScore?: number;
    companyDetails?: {
        industry: string;
        revenue: string;
        employeeCount: string;
        description?: string;
    };
    contactHistory?: ContactHistoryItem[];
    notes?: string;
    linkedInUrl?: string;
    recentNews?: string[];
    aiAnalysis?: {
        communicationStyle: string;
        motivations: string[];
        painPoints: string[];
    };
    groundingSources?: any[];
    // FIX: Add missing 'source' property to Prospect type to resolve errors in data/prospects.ts.
    source?: string;
}

export interface ResearchResult {
    id: string;
    companyName: string;
    industry: string;
    hqAddress: string;
    employeeCount: string;
    companySize: string;
    annualRevenue: string;
    website: string;
    mainPhone: string;
    yearFounded: number;
    executiveName: string;
    executivePosition: string;
    executiveEmail: string;
    directPhone: string;
    linkedInProfile: string;
    dataConfidenceScore: number;
    // For outreach plan
    recommendedProducts?: string[];
    talkingPoints?: string[];
    personalizedEmail?: string;
    linkedinMessage1?: string;
    linkedinMessage2?: string;
    linkedinMessage3?: string;
    isGeneratingOutreach?: boolean;
    isOutreachGenerated?: boolean;
    outreachSources?: any[];
}


export interface Email {
    id: string;
    from: string;
    to: string;
    subject: string;
    preview: string;
    body: string;
    time: string;
    fullTime: string;
    read: boolean;
    hasAttachment: boolean;
    isImportant: boolean;
    threadCount: number;
    status: 'sent' | 'delivered' | 'opened' | 'replied';
    tracking: {
        opened: boolean;
        clicked: boolean;
        replied: boolean;
    };
    avatarColor: string;
    initials: string;
    folder: 'Inbox' | 'Sent' | 'Drafts' | 'Trash';
    isNew?: boolean;
}

export interface NewProspectData {
    name: string;
    company: string;
    email: string;
    phone?: string;
    title?: string;
    status: ProspectStatus;
    tags: string[];
    // FIX: Add 'source' property to allow tracking where a prospect was added from.
    source?: string;
}

export interface ProspectList {
    id: string;
    name: string;
    prospectIds: string[];
    createdAt: string;
}

export type DealStatus = 'Proposal' | 'Negotiating' | 'Won' | 'Lost';

export interface DealLineItem {
    id: string;
    productId: string;
    name: string;
    basePrice: number;
    commissionRate: number;
    billingType: 'Monthly' | 'One-time';
    negotiatedCommissionRate?: number;
    discountRate?: number;
}
  
export interface Deal {
    id: string;
    prospectId: string;
    name: string;
    status: DealStatus;
    lineItems: DealLineItem[];
    createdAt: Date;
    updatedAt: Date;
}

export interface Product {
    id: string;
    tier: string;
    name: string;
    description: string[];
    billingType: 'Monthly' | 'One-time';
    basePrice: number;
    commissionRate: number;
    negotiatedCommissionRate: number;
    discountRate: number;
}

// FIX: Add 'roles' to SettingsTab to allow for the Roles & Permissions settings page.
export type SettingsTab = 'profile' | 'security' | 'account' | 'team' | 'appearance' | 'billing' | 'notifications' | 'ai-provider' | 'roles';
export type AIProvider = 'gemini' | 'openai' | 'anthropic' | 'mock' | 'glm';
export type ApiKeys = { [key in AIProvider]?: string; };

// FIX: Add missing types for Toast notifications and Role-based permissions.
export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
}

export type RolePermissions = {
  [key in UserRole]: View[];
};

export interface CampaignStep {
    id: string;
    type: 'Email' | 'LinkedIn' | 'Call' | 'Task' | 'WhatsApp';
    delayDays: number;
    templateId?: string;
    message?: string;
}

export interface Campaign {
    id: string;
    name: string;
    status: 'Active' | 'Draft' | 'Completed';
    sent: number;
    opens: number;
    clicks: number;
    replies: number;
    createdDate: string;
    steps: CampaignStep[];
    prospectIds: string[];
    prospectListIds: string[];
}

export interface Playbook {
  id: string;
  title: string;
  category: string;
  description: string;
  content: string;
}

export interface TranscriptEntry {
    speaker: 'user' | 'ai';
    text: string;
    isPartial?: boolean;
}

// Unified Workflow Types
export type WorkflowStepAction = 
  | { type: 'sendTemplate'; templateId: string }
  | { type: 'sendAIEmail'; tone: string; purpose: string; keyPoints?: string }
  | { type: 'createTask'; taskDescription: string }
  | { type: 'wait'; days: number };

export interface WorkflowStep {
    id: string;
    action: WorkflowStepAction;
}

export interface Workflow {
  id: string;
  name: string;
  trigger: {
    type: 'statusChange';
    status: ProspectStatus;
  };
  steps: WorkflowStep[];
}
