
export type View =
  | 'Dashboard' | 'Email Inbox' | 'Prospects' | 'Campaigns'
  | 'Lead Generation' | 'Products' | 'Analytics' | 'Live Call'
  | 'Integrations' | 'Settings' | 'Workflows' | 'Playbooks' | 'AI Generator'
  // Granular settings views for permissions
  | 'Settings - Team' | 'Settings - AI Provider' | 'Settings - Roles' | 'Settings - Billing';

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
    type: 'Email' | 'Call' | 'Meeting' | 'Live Call Practice';
    outcome: string;
    aiInsight: string;
    duration?: string;
    title?: string;
    summary?: string;
    transcript?: string;
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

export type SettingsTab = 'profile' | 'security' | 'account' | 'team' | 'appearance' | 'billing' | 'notifications' | 'ai-provider' | 'roles';
export type AIProvider = 'gemini' | 'openai' | 'anthropic' | 'mock' | 'glm';
export type ApiKeys = { [key in AIProvider]?: string; };

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
}

// FIX: Define PermissionAction to be used for role-based access control.
export interface PermissionAction {
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
}

// FIX: Update RolePermissions to correctly type the permissions object.
export type RolePermissions = {
  [key in UserRole]: {
    [key in View]?: Partial<PermissionAction>;
  };
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
