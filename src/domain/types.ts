export const leadStatuses = ['new', 'contacted', 'quoted', 'booked', 'closed'] as const;
export type LeadStatus = (typeof leadStatuses)[number];

export type Category = {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
};

export type Project = {
  id: string;
  title: string;
  slug: string;
  description: string;
  categoryId: string | null;
  thumbnail: string;
  videoUrl: string;
  actualVideoUrl: string;
  playbackSource: 'uploaded' | 'external';
  clientName: string;
  year: string;
  duration: string;
  role: string;
  featured: boolean;
  published: boolean;
  sortOrder: number;
};

export type Inquiry = {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  status: LeadStatus;
  notes: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Testimonial = {
  id: string;
  quote: string;
  author: string;
  role: string;
  published: boolean;
  sortOrder: number;
};

export type Offering = {
  id: string;
  title: string;
  description: string;
  published: boolean;
  sortOrder: number;
};

export type ProcessStep = {
  title: string;
  copy: string;
};

export type SiteProfile = {
  displayName: string;
  roleTitle: string;
  location: string;
  heroEyebrow: string;
  heroHeadline: string;
  heroHighlight: string;
  heroCopy: string;
  aboutEyebrow: string;
  aboutTitle: string;
  aboutParagraphs: string[];
  tools: string[];
  process: ProcessStep[];
  contactEyebrow: string;
  contactTitle: string;
  contactCopy: string;
  email: string;
  instagram: string;
};

export type PublicPortfolio = {
  profile: SiteProfile;
  categories: Category[];
  projects: Project[];
  featured: Project[];
  offerings: Offering[];
  testimonials: Testimonial[];
};

export type AdminWorkspace = {
  projects: Project[];
  categories: Category[];
  inquiries: Inquiry[];
  testimonials: Testimonial[];
  offerings: Offering[];
  profile: SiteProfile;
};
