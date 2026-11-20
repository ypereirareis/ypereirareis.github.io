export const SITE = {
  title: "Yannick Pereira-Reis",
  description:
    "Platform engineer. Resume and technical writing about platform engineering, CI/CD, Kubernetes, observability and developer experience.",
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
  { href: "/posts/", label: "Posts" },
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
    text: "Solving problems and making teams autonomous.",
    hue: "indigo",
    items: [
      "Contributed to a containerized dev environment shared by workstations and CI (dev containers, mise).",
      "Contributed to a Terragrunt Stacks template for ephemeral AWS test environments, used to test infrastructure modules and Helm charts.",
      "Led platform-wide changes, such as moving every Argo CD application to a multi-region layout across all environments.",
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
      "Proofs of concept to evaluate new tools before adoption.",
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
      "Renovate dependency updates, Conventional Commits, pre-commit hooks and secret scanning with gitleaks.",
      "Automating repetitive work, from scaffolding to releases.",
    ],
  },
  {
    title: "Operations & Observability",
    text: "Keeping production healthy and understood.",
    hue: "amber",
    items: [
      "Deployments and environment promotions with Argo CD.",
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
      "Fixing security vulnerabilities.",
    ],
  },
  {
    title: "Engineering Quality",
    text: "Code that stays reliable and easy to change.",
    hue: "violet",
    items: [
      "Code reviews, partly automated with Danger rules.",
      "Hands-on development in Python, Terraform and Helm.",
      "Unit, functional and mutation testing, plus platform tests on a sandbox environment (autoscaling, preStop hooks, resource thresholds).",
      "Paying down technical debt.",
    ],
  },
];
