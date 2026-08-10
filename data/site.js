export const site = {
  name: "Rohith Varma Vegesna",
  shortName: "R.V. Vegesna",
  role: "Senior Software Engineer & Tech Lead",
  company: "7-Eleven",
  location: "Dallas–Fort Worth, TX",
  url: "https://www.rohithv.com",
  email: "rohithvegesna@gmail.com",
  github: "https://github.com/rohithvegesna",
  linkedin: "https://www.linkedin.com/in/rohithvegesna/",
  scholar: "https://scholar.google.com/citations?user=tRuKSz4AAAAJ",
  orcid: "https://orcid.org/0009-0004-7568-9188",
  researchgate: "https://www.researchgate.net/profile/Rohith-Vegesna-4",
  ieee: "https://ieeexplore.ieee.org/author/331330311010189",
  description:
    "Senior Software Engineer & Tech Lead building secure payment and IoT infrastructure for fuel retail at national scale. 20+ IEEE publications.",
};

export const experience = [
  {
    org: "7-Eleven",
    place: "Irving, TX",
    roles: [
      {
        period: "May 2026 — Present",
        title: "Senior Software Engineer",
        body: "Tech Lead on the FuelControl platform behind 7-Eleven's retail fuel network — Speedway, 7-Eleven, Exxon, Phillips 66, and Stripes. Leads the team, owns cloud and AWS architecture across the Gilbarco and Wayne dispenser ecosystem, and designed the multi-signal observability platform that tells on-call whether a store is offline, idle, or has a broken cloud path.",
      },
      {
        period: "Nov 2021 — May 2026",
        title: "Software Engineer II",
        body: "Designed the fleet-wide CloudWatch observability architecture — EMF metrics, baseline store registries, silent-store detection — that gave the on-call team its first per-store reachability signal. Delivered the Unitec WSII carwash integration chain-wide, contributed to the EMV state machine and BER-TLV messaging behind payments at the pump, and built the incident-response tooling that lets junior engineers diagnose store issues without senior backup.",
      },
      {
        period: "May 2020 — Nov 2021",
        title: "Full-Stack Developer",
        body: "Designed the FID (Forecourt Integration Device) messaging layer connecting POS systems to the fuel controller — the foundation for carwash-at-pump sales and dynamic pricing across the chain. Built the first integration letting customers start a fuel transaction from the mobile app, and a JUnit 5 framework that simulated full transaction flows without dispenser hardware.",
      },
      {
        period: "Oct 2019 — May 2020",
        title: "Java Software Developer",
        body: "Wrote the foundational EMV transaction code for fuel dispensers — Spring State Machine and a byte-level communication layer — that the payments stack still runs on today. Built a Python/PyQt5 dispenser simulator for end-to-end testing without physical hardware.",
      },
    ],
  },
  {
    org: "TCompliance",
    place: "Dallas–Fort Worth, TX",
    roles: [
      {
        period: "Jun 2018 — Jun 2019",
        title: "Software Developer Intern",
        body: "Built and deployed GPS tracking devices and REST APIs (Java, Spark Framework) connecting the platform to LabCorp's lab systems for live specimen tracking and compliance reporting.",
      },
    ],
  },
  {
    org: "revaalo",
    place: "Bengaluru, India",
    roles: [
      {
        period: "Apr 2017 — Apr 2018",
        title: "Software Developer",
        body: "Built factory-automation software for the IoT device fleet powering ABB's Smart Factory initiative — server-side device control, automated reboot orchestration, and a Smart Factory database schema and IoT network topology designed from scratch.",
      },
    ],
  },
  {
    org: "NGCN Infosolutions",
    place: "Bengaluru, India",
    roles: [
      {
        period: "Apr 2015 — Mar 2017",
        title: "Software Developer",
        body: "Built inventory-and-billing software, an HRM platform with automated monthly payroll, and a job board with online applicant exams and resume management.",
      },
    ],
  },
];

export const education = [
  {
    period: "2018 — 2019",
    title: "M.S. Computer and Information Sciences",
    org: "Southern Arkansas University",
    place: "Magnolia, AR",
  },
  {
    period: "2013 — 2017",
    title: "B.Tech. Mechanical Engineering",
    org: "GITAM University",
    place: "Visakhapatnam, India",
  },
];

export const skills = [
  {
    domain: "Cloud & AWS",
    items: [
      "IoT Core",
      "Lambda",
      "ECS",
      "Kinesis",
      "DynamoDB",
      "CloudWatch",
      "CloudFormation",
      "CloudFront",
      "S3",
    ],
  },
  {
    domain: "Languages & Runtimes",
    items: ["Java / Spring Boot", "Node.js", "Python", "JavaScript / React"],
  },
  {
    domain: "Payments & Edge",
    items: [
      "EMV at the dispenser",
      "Edge state machines",
      "Store-and-forward telemetry",
      "MQTT",
      "Custom USB-HID devices",
      "PXE fleet imaging",
    ],
  },
  {
    domain: "Data",
    items: ["MongoDB", "DynamoDB", "Redis", "PostgreSQL", "MySQL"],
  },
  {
    domain: "Delivery",
    items: ["Jenkins", "GitLab CI", "GitHub Actions", "Docker", "Kubernetes"],
  },
  {
    domain: "Leadership",
    items: ["Team lead", "Mentoring", "Architecture review"],
  },
];
