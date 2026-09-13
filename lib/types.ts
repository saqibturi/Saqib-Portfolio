export type Expertise = { title: string; description: string; tags: string[] };
export type Timeline = {
  title: string;
  organization: string;
  period: string;
  description: string;
};
export type Profile = {
  name: string;
  title: string;
  heroHeadline: string;
  heroAccent: string;
  intro: string;
  about: string;
  email: string;
  phone: string;
  location: string;
  availability: string;
  photo: string;
  resume: string;
  socials: { label: string; url: string }[];
  expertise: Expertise[];
  experience: Timeline[];
  education: Timeline[];
  sections: string[];
  seoTitle: string;
  seoDescription: string;
  ogImage: string;
  pageSeo: Record<string, { title: string; description: string }>;
};
export type Project = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  category: string;
  tags: string[];
  cover: string;
  coverAlt: string;
  gallery: { url: string; alt: string; caption: string }[];
  role: string;
  timeline: string;
  github: string;
  demo: string;
  featured: boolean;
  order: number;
  problem: string;
  approach: string;
  data: string;
  implementation: string;
  evaluation: string;
  limitations: string;
  outcomes: string;
};
export const emptyProject: Project = {
  id: "",
  slug: "",
  title: "",
  summary: "",
  category: "Machine Learning",
  tags: [],
  cover: "",
  coverAlt: "",
  gallery: [],
  role: "",
  timeline: "",
  github: "",
  demo: "",
  featured: false,
  order: 0,
  problem: "",
  approach: "",
  data: "",
  implementation: "",
  evaluation: "",
  limitations: "",
  outcomes: "",
};

export type Certificate = {
  id: string;
  title: string;
  issuer: string;
  issued: string;
  expires: string;
  credentialId: string;
  verificationUrl: string;
  description: string;
  skills: string[];
  file: string;
  thumbnail: string;
  alt: string;
  order: number;
};
export const emptyCertificate: Certificate = {
  id: "",
  title: "",
  issuer: "",
  issued: "",
  expires: "",
  credentialId: "",
  verificationUrl: "",
  description: "",
  skills: [],
  file: "",
  thumbnail: "",
  alt: "",
  order: 0,
};
