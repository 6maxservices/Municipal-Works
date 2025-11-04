export enum Screen {
  ROLE_SELECTION,
  DASHBOARD,
  UPLOAD,
  PROCESSING,
  DRAFT,
  APPROVAL,
  CONFIRMATION,
  PREVIEW,
}

export enum DashboardView {
  ALL = 'Όλα τα Έργα',
  MY_ARTICLES = 'Τα Άρθρα μου',
  PENDING_APPROVAL = 'Προς Αξιολόγηση',
  APPROVED = 'Εγκεκριμένα',
}

export enum UserRole {
  INSPECTOR = 'Inspector',
  SUPERVISOR = 'Supervisor',
}

export enum ProjectStatus {
  PENDING = 'Εκκρεμεί',
  IN_PROGRESS = 'Σε Εξέλιξη',
  COMPLETED = 'Ολοκληρωμένο',
}

export enum ArticleStatus {
  NONE = 'Χωρίς Άρθρο',
  DRAFT = 'Πρόχειρο',
  PENDING_APPROVAL = 'Εκκρεμεί Έγκριση',
  APPROVED = 'Εγκεκριμένο',
}

export interface ImageFile {
  id: number;
  file: File;
  previewUrl: string;
}

export interface ProcessedImage {
  id: number;
  url: string;
  caption: string;
}

export interface ImagePair {
  before: ProcessedImage;
  after: ProcessedImage;
}

export interface ProjectData {
  description: string;
  location: {
    name: string;
    coords: { lat: number; lng: number };
  };
  images: ImageFile[];
  projectType: string;
  keyPoints: string[];
  articleTitle: string;
  articleSubtitle: string;
  articleBody: string;
  imagePairs: ImagePair[];
  service: string;
  date: string;
}

export interface Project {
  id: number;
  name: string;
  location: string;
  projectStatus: ProjectStatus;
  articleStatus: ArticleStatus;
  articleData?: ProjectData;
}