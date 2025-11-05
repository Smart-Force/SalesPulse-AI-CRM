import React from 'react';

export type View = 'dashboard' | 'lead-generation' | 'email-inbox' | 'email-automation' | 'settings' | 'prospects' | 'campaigns' | 'ai-generator' | 'analytics' | 'business-intelligence' | 'integrations';

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
  type: 'Email' | 'LinkedIn' | 'WhatsApp';
  templateId: string;
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