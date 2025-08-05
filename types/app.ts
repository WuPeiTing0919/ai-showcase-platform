export interface App {
  id: string;
  name: string;
  description: string;
  creatorId: string;
  teamId?: string;
  status: AppStatus;
  type: AppType;
  filePath?: string;
  techStack?: string[];
  tags?: string[];
  screenshots?: string[];
  demoUrl?: string;
  githubUrl?: string;
  docsUrl?: string;
  version: string;
  likesCount: number;
  viewsCount: number;
  rating: number;
  createdAt: string;
  updatedAt: string;
  lastUpdated: string;
}

export type AppStatus = 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'published';

export type AppType = 
  | 'web_app' 
  | 'mobile_app' 
  | 'desktop_app' 
  | 'api_service' 
  | 'ai_model' 
  | 'data_analysis' 
  | 'automation' 
  | 'productivity' 
  | 'educational' 
  | 'healthcare' 
  | 'finance' 
  | 'iot_device' 
  | 'blockchain' 
  | 'ar_vr' 
  | 'machine_learning' 
  | 'computer_vision' 
  | 'nlp' 
  | 'robotics' 
  | 'cybersecurity' 
  | 'cloud_service' 
  | 'other';

export interface AppCreator {
  id: string;
  name: string;
  email: string;
  department: string;
  role: string;
}

export interface AppTeam {
  id: string;
  name: string;
  leaderId: string;
  department: string;
  contactEmail: string;
}

export interface AppWithDetails extends App {
  creator: AppCreator;
  team?: AppTeam;
}

export interface AppStats {
  total: number;
  published: number;
  pendingReview: number;
  draft: number;
  approved: number;
  rejected: number;
  byType: Record<AppType, number>;
  byStatus: Record<AppStatus, number>;
}

export interface AppSearchParams {
  search?: string;
  type?: AppType;
  status?: AppStatus;
  creatorId?: string;
  teamId?: string;
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'created_at' | 'rating' | 'likes_count' | 'views_count';
  sortOrder?: 'asc' | 'desc';
}

export interface AppCreateRequest {
  name: string;
  description: string;
  type: AppType;
  teamId?: string;
  techStack?: string[];
  tags?: string[];
  demoUrl?: string;
  githubUrl?: string;
  docsUrl?: string;
  version?: string;
}

export interface AppUpdateRequest {
  name?: string;
  description?: string;
  type?: AppType;
  teamId?: string;
  status?: AppStatus;
  techStack?: string[];
  tags?: string[];
  screenshots?: string[];
  demoUrl?: string;
  githubUrl?: string;
  docsUrl?: string;
  version?: string;
}

export interface AppFileUpload {
  file: File;
  appId: string;
  type: 'screenshot' | 'document' | 'source_code';
}

export interface AppRating {
  appId: string;
  rating: number;
  comment?: string;
}

export interface AppLike {
  appId: string;
  userId: string;
}

export interface AppView {
  appId: string;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
} 