import type { Profile } from "./types";
export const initialProfile: Profile = {
  name: "Saqib Muhammad",
  title: "AI & Machine Learning Engineer",
  heroHeadline: "Intelligent ideas.",
  heroAccent: "Built for people.",
  intro:
    "I build websites, train machine learning models, and bring a practical ecommerce perspective to the problems I solve.",
  about:
    "I’m pursuing a BS in Artificial Intelligence at Iqra University, Islamabad Campus. Alongside my studies, I work with Python and C++, build websites, and design Shopify stores.\n\nWith over two years of hands-on ecommerce experience and a completed machine learning internship at Rhombix Technologies, I connect technical learning with the everyday needs of online businesses.",
  email: "contact.saqibmuhammad@gmail.com",
  phone: "+923308925715",
  location: "Islamabad, Pakistan",
  availability: "Open to opportunities & collaborations",
  photo: "/portrait.webp",
  resume: "",
  socials: [
    {
      label: "LinkedIn",
      url: "https://www.linkedin.com/in/saqib-muhammad-ai/",
    },
    { label: "GitHub", url: "https://github.com/saqibturi" },
    { label: "Instagram", url: "https://www.instagram.com/imsaqib_turi/" },
    { label: "Facebook", url: "https://www.facebook.com/share/1DibDXWt4S/" },
  ],
  expertise: [
    {
      title: "AI & Machine Learning",
      description:
        "Training models and using programming to explore practical, data-driven solutions.",
      tags: ["Python", "Machine Learning", "Model Training"],
    },
    {
      title: "Web Development",
      description:
        "Thoughtful websites built around business goals and the people using them.",
      tags: ["Web Development", "Python", "C++"],
    },
    {
      title: "Shopify & Ecommerce",
      description:
        "Shopify website design informed by more than two years of hands-on ecommerce experience.",
      tags: ["Shopify", "Ecommerce", "Website Design"],
    },
    {
      title: "Digital Marketing",
      description:
        "Supporting product promotion and connecting online stores with their audiences.",
      tags: ["Digital Marketing", "Ecommerce"],
    },
  ],
  experience: [
    {
      title: "Machine Learning Internship",
      organization: "Rhombix Technologies",
      period: "Completed",
      description:
        "Professional experience alongside my Artificial Intelligence studies.",
    },
    {
      title: "Ecommerce & Shopify",
      organization: "Hands-on experience",
      period: "2+ years",
      description:
        "Shopify website design, ecommerce activities, and digital marketing.",
    },
  ],
  education: [
    {
      title: "BS Artificial Intelligence",
      organization: "Iqra University · Islamabad Campus",
      period: "In progress",
      description:
        "Developing foundations in programming, machine learning, and applied problem solving.",
    },
  ],
  sections: ["expertise", "projects", "about", "experience", "certifications"],
  seoTitle: "Saqib Muhammad | AI, Machine Learning & Web Development",
  seoDescription:
    "Explore Saqib Muhammad’s work in AI, machine learning, web development, Shopify, and ecommerce. Based in Islamabad, Pakistan.",
  ogImage: "",
  pageSeo: {
    projects: {
      title: "Projects",
      description:
        "Machine learning, web development, and ecommerce case studies by Saqib Muhammad.",
    },
    about: {
      title: "About",
      description:
        "Meet Saqib Muhammad, AI student and developer with Shopify and ecommerce experience.",
    },
    contact: {
      title: "Contact",
      description:
        "Contact Saqib Muhammad for projects, collaborations, and professional opportunities.",
    },
  },
};
export function siteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(
    /\/$/,
    "",
  );
}
