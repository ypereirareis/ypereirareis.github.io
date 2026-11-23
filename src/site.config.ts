export const SITE = {
  title: "Yannick Pereira-Reis",
  description:
    "Platform engineer. Resume and technical writing about platform engineering, CI/CD, Kubernetes, observability and developer experience.",
  author: "Yannick Pereira-Reis",
  jobTitle: "Platform Engineer",
  locale: "en_US",
  lang: "en",
  /** Source code of this site (not a profile: kept out of `links`, used for JSON-LD sameAs). */
  repo: "https://github.com/ypereirareis/ypereirareis.github.io",
  links: {
    github: "https://github.com/ypereirareis",
    linkedin: "https://www.linkedin.com/in/yannickpereirareis",
  },
} as const;

export const NAV = [
  { href: "/", label: "Home" },
  { href: "/posts/", label: "Posts" },
  { href: "/cv/", label: "CV" },
] as const;

/** Short introduction under the main title of the home page. `**text**` is rendered in bold. */
export const INTRO_POINTS = [
  "I build and run **internal platforms** that let product teams ship safely and fast.",
  "Automation is a way of life: if I do it twice, I script it.",
  "**Software engineer first**, with years of **backend and full-stack development**.",
  "Then **DevOps** and now **Platform Engineer**.",
  "**Remote work** is my natural habitat, but I still migrate to the office now and then to see my colleagues (and the coffee machine).",
  "Special thanks to **Claude**, my pair-programming partner.",
];

/** Post topics: what kind of subject a post covers (not technologies). 1 or 2 per post. */
export const TOPICS = [
  "development",
  "architecture",
  "infrastructure",
  "platform",
  "operations",
  "security",
] as const;

/** Accent hues, defined as CSS custom properties in global.css. */
export type Hue = "indigo" | "cyan" | "emerald" | "amber" | "rose" | "violet";

/** "What I do or did" section of the home page: one card per area, with detailed points. */
export const FOCUS_AREAS: { title: string; text: string; hue: Hue; items: string[] }[] = [
  {
    title: "Staff Engineering & Enablement",
    text: "Owning platform components, designing for resilience and making teams autonomous.",
    hue: "indigo",
    items: [
      "Owner of the software factory, CI/CD and GitOps system components of the platform.",
      "Working with the owners of the other components (gateway, data, workload, network…) on cross-cutting platform topics.",
      "Contributed to the design of a multi-region, active-passive disaster recovery plan on AWS.",
      "Led platform-wide changes, such as moving every Argo CD application to a multi-region layout across all environments.",
      "Proofs of concept to evaluate new tools before adoption.",
      "Documentation: design docs, technical and functional documentation, contributing guides, published with MkDocs.",
      "Training and knowledge transfer to feature teams, from how-tos to onboarding.",
      "Daily communication in English with distributed teams.",
    ],
  },
  {
    title: "Platform & GitOps",
    text: "Building the platform product teams deploy on, declared in Git.",
    hue: "cyan",
    items: [
      "Single GitOps live repository: Argo CD ApplicationSets for applications, Terragrunt for infrastructure, across AWS regions and environments.",
      "Amazon EKS add-ons: Karpenter autoscaling, cert-manager and the Secrets Store CSI driver.",
      "Crossplane to manage cloud resources the GitOps way.",
      "Helm umbrella charts and a shared library chart for product teams (probes, preStop hooks, autoscaling, resources).",
      "Reusable Terragrunt modules for AWS: VPC, EKS, RDS, MSK, OpenSearch, CloudFront, Route 53.",
      "Contributed to a containerized dev environment shared by workstations and CI (dev containers, mise).",
    ],
  },
  {
    title: "CI/CD & Automation",
    text: "Fast, consistent pipelines and automation everywhere.",
    hue: "emerald",
    items: [
      "A single, shared CI written in Python for all repositories.",
      "Terragrunt continuous deployment: plan and apply per change, scheduled drift detection, state backups, GitLab-to-AWS OIDC authentication.",
      "GitLab managed as code with Terraform (projects, access, runners).",
      "Automated code review with Danger: change labels and auto-approval rules.",
      "Renovate dependency updates, Conventional Commits and pre-commit hooks.",
      "Automating repetitive work, from scaffolding to releases.",
    ],
  },
  {
    title: "Operations & Observability",
    text: "Keeping production healthy and understood.",
    hue: "amber",
    items: [
      "Deployments and environment promotions with Argo CD and Terragrunt, thanks to automated bumps done by Renovate.",
      "On-call rotation, incident response and blameless post-mortems.",
      "Dashboards and metrics with Datadog, Grafana and Prometheus, log pipelines with Vector.",
      "Backups of databases and secrets with a dedicated Kubernetes operator.",
      "Hands-on debugging across applications, infrastructure and pipelines.",
    ],
  },
  {
    title: "Security & Identity",
    text: "Secure by default, from the image to the identity.",
    hue: "rose",
    items: [
      "Identity and access management as code: Okta groups and apps, AWS IAM and AWS IAM Identity Center.",
      "SAML single sign-on for platform tools such as Argo CD and HashiCorp Vault.",
      "Secrets management with HashiCorp Vault and the Secrets Store CSI driver, multi-region.",
      "Policy enforcement in Kubernetes with Kyverno.",
      "Hardened Docker images built and checked in CI.",
      "Secret scanning with gitleaks in pre-commit hooks and CI.",
      "Fixing security vulnerabilities.",
    ],
  },
  {
    title: "Engineering Quality",
    text: "Code that stays reliable and easy to change.",
    hue: "violet",
    items: [
      "Code reviews.",
      "Hands-on development in Python, Terraform and Helm.",
      "Unit, functional and mutation testing, plus platform tests on a sandbox environment.",
      "Contributed to a Terragrunt Stacks template for ephemeral AWS test environments, used to test infrastructure modules and Helm charts.",
      "Paying down technical debt.",
    ],
  },
];
