import React from 'react';

export type View = 'dashboard' | 'lead-generation' | 'email-inbox' | 'playbooks' | 'settings' | 'prospects' | 'campaigns' | 'ai-generator' | 'analytics' | 'business-intelligence' | 'integrations' | 'products';

export interface NavItem {
  name: string;
  view: View;
  icon: React.ElementType;
  badge?: number;
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
  status: 'sent' | 'delivered' | 'opened' | 'clicked' | 'replied';
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


export interface GeneratorFormState {
  recipient: string;
  purpose: string;
  tone: string;
  keyPoints: string;
}

export type ProspectStatus = 'New' | 'Contacted' | 'Engaged' | 'Meeting' | 'Closed';
export type ConfidenceScore = 'High' | 'Medium' | 'Low';

export interface ContactHistoryItem {
  date: string;
  type: 'Email' | 'Call' | 'Meeting';
  outcome: string;
  aiInsight?: string;
  duration?: string;
}

export interface Prospect {
  id: string;
  name: string;
  avatarColor: string;
  initials: string;
  company: string;
  email: string;
  phone?: string;
  title?: string;
  status: ProspectStatus;
  lastContact: string;
  lastContactDate: Date;
  tags: string[];
  dealIds?: string[];

  // Prospect Intelligence Fields
  isEnriched?: boolean;
  confidenceScore?: ConfidenceScore;
  decisionAuthorityScore?: number;
  linkedInUrl?: string;
  companyDetails?: {
    industry?: string;
    revenue?: string;
    employeeCount?: string;
    description?: string;
  };
  recentNews?: string[];
  aiAnalysis?: {
    communicationStyle?: string;
    motivations?: string[];
    painPoints?: string[];
  };
  contactHistory?: ContactHistoryItem[];
  notes?: string;
  groundingSources?: any[];
}


export interface Template {
  id: string;
  name: string;
  subject: string;
  body: string;
}

export interface CampaignStep {
  id:string;
  type: 'Email' | 'LinkedIn' | 'WhatsApp' | 'Call' | 'Task';
  templateId?: string;
  message?: string;
  delayDays: number;
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

export interface ProspectList {
  id: string;
  name: string;
  prospectIds: string[];
  createdAt: string;
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
    // Sales Enablement fields - initially null
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

export interface NewProspectData {
    name: string;
    company: string;
    email: string;
    phone?: string;
    title?: string;
    status: ProspectStatus;
    tags: string[];
}

export type UserRole = 'Admin' | 'Member';

export interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    avatarUrl?: string;
    avatarColor: string;
    initials: string;
}

export type SettingsTab = 'profile' | 'security' | 'account' | 'appearance' | 'billing' | 'notifications' | 'team';

// New Playbook types
export type PlaybookTriggerType = 'prospect_status_change';

export interface PlaybookTrigger {
    type: PlaybookTriggerType;
    value: ProspectStatus;
}

export type PlaybookActionType = 'generate_and_send_ai_email' | 'send_email_template' | 'wait';

export interface PlaybookAction {
    id: string;
    type: PlaybookActionType;
    // For 'generate_and_send_ai_email'
    goal?: string;
    tone?: string;
    keyPoints?: string;
    // For 'send_email_template'
    templateId?: string;
    // For 'wait'
    days?: number;
}

export interface Playbook {
    id: string;
    name: string;
    isActive: boolean;
    trigger: PlaybookTrigger;
    actions: PlaybookAction[];
}

export interface Product {
  id: string;
  tier: string;
  name: string;
  description: string[];
  billingType: 'Monthly' | 'One-time';
  basePrice: number;
  commissionRate: number; // e.g., 0.25 for 25%
  negotiatedCommissionRate: number;
  discountRate: number;
}

// Deal-related types
export type DealStatus = 'Proposal' | 'Negotiating' | 'Won' | 'Lost';

export interface DealLineItem {
    id: string; // Unique ID for this line item instance
    productId: string;
    name: string; // Copied from product for display
    basePrice: number; // Copied from product
    billingType: 'Monthly' | 'One-time';
    commissionRate: number; // Base commission rate from product
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