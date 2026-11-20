export const SITE = {
  title: "Yannick Pereira-Reis",
  description:
    "Platform engineer. Resume and technical blog about platform engineering, CI/CD, Kubernetes, observability and developer experience.",
  author: "Yannick Pereira-Reis",
  jobTitle: "Platform Engineer",
  locale: "en_US",
  lang: "en",
  links: {
    github: "https://github.com/ypereirareis",
    linkedin: "https://www.linkedin.com/in/yannickpereirareis",
  },
} as const;

export const NAV = [
  { href: "/", label: "Home" },
  { href: "/cv/", label: "CV" },
  { href: "/blog/", label: "Blog" },
] as const;
