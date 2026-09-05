export const ECOSYSTEM_STRIP = [
  { label: "Membership", phrase: "Profiles, applications, membership records and standing" },
  { label: "Contributions", phrase: "Contribution records, payments and statements" },
  { label: "Documents", phrase: "Contracts, certificates, agreements and records" },
  { label: "Livestock", phrase: "Animal records, farms, ownership and movement" },
  { label: "Operations", phrase: "Procurement, assets, inventory and logistics" },
  { label: "Management", phrase: "Administration, reporting, oversight and coordination" },
] as const;

export const HOW_IT_WORKS = [
  { step: "01", title: "Apply", copy: "Submit your application and required information." },
  {
    step: "02",
    title: "Approval",
    copy: "Your application is reviewed and approved by the authorised team.",
  },
  {
    step: "03",
    title: "Joining Fee",
    copy: "The R2,500 non-refundable administrative and onboarding fee is received.",
  },
  {
    step: "04",
    title: "First Contribution",
    copy: "The first R500 monthly contribution is received and recorded.",
  },
  {
    step: "05",
    title: "Agreement",
    copy: "Complete the required agreement and acceptance process.",
  },
  {
    step: "06",
    title: "Member",
    copy: "Membership becomes active subject to governing documents and applicable law.",
  },
] as const;

export const ECOSYSTEM_CARDS = [
  {
    id: "ME",
    title: "Members",
    copy: "Member profiles, applications, membership records and standing.",
  },
  {
    id: "CO",
    title: "Contributions",
    copy: "Contribution records, payment history and statements.",
  },
  {
    id: "DO",
    title: "Documents",
    copy: "Contracts, certificates, agreements and important organisational records.",
  },
  {
    id: "LI",
    title: "Livestock",
    copy: "Animal records, ownership, farms, movement and livestock development.",
  },
  {
    id: "OP",
    title: "Operations",
    copy: "Procurement, inventory, assets, suppliers and logistics.",
  },
  {
    id: "MA",
    title: "Management",
    copy: "Central administration, reporting, oversight and organisational coordination.",
  },
] as const;

export const FUTURE_PILLARS = [
  {
    step: "01",
    title: "Digital Membership",
    copy: "Connected member profiles, applications, records and participation.",
  },
  {
    step: "02",
    title: "Livestock Development",
    copy: "Structured livestock management, farm information and development projects.",
  },
  {
    step: "03",
    title: "Operational Management",
    copy: "Procurement, assets, inventory, logistics and organisational coordination.",
  },
  {
    step: "04",
    title: "Connected Enterprise",
    copy: "Systems and structures supporting enterprise activity, development and opportunity.",
  },
  {
    step: "05",
    title: "Sustainable Growth",
    copy: "A long-term foundation for organisational development, productive participation and shared economic opportunity.",
  },
] as const;

export const CONTACT_INFO = {
  email: "info@lefaconnect.com",
  address: "146 Second St, Parkmore, Sandton, South Africa",
  phone: "+27 63 111 1871",
} as const;

export const MEMBERSHIP_STRUCTURE = [
  {
    label: "NON-REFUNDABLE JOINING FEE",
    amount: "R2,500",
    title: "Joining fee",
    description:
      "Administrative and onboarding fee. Tracked separately from monthly contributions and share ownership.",
  },
  {
    label: "MONTHLY CONTRIBUTION",
    amount: "R500",
    title: "Monthly contribution",
    description:
      "The standard monthly contribution for an active member. The approved structure links it to the member's standard share allocation.",
  },
  {
    label: "STANDARD GROUP STRUCTURE",
    amount: "10 SHARES",
    title: "Standard allocation",
    description:
      "A standard group is structured around 100 Member slots and 1,000 shares: 10 shares per Member slot unless the approved structure or additional purchases result in a different recorded shareholding.",
  },
] as const;

export const MEMBERSHIP_ACTIVATION = [
  { step: "01", title: "Apply", copy: "Submit your application and required information." },
  { step: "02", title: "Approval", copy: "Your application is reviewed and approved." },
  { step: "03", title: "Joining Fee", copy: "The R2,500 joining fee is received." },
  {
    step: "04",
    title: "First Contribution",
    copy: "The first R500 monthly contribution is received.",
  },
  {
    step: "05",
    title: "Agreement",
    copy: "Complete the required agreement and acceptance process.",
  },
  {
    step: "06",
    title: "Member",
    copy: "Membership becomes active subject to governing documents and applicable law.",
  },
] as const;

export const OPERATIONS_GROUPS = [
  {
    title: "Resources & Assets",
    copy: "Procurement, inventory, assets and organisational resources.",
  },
  {
    title: "Operations & Coordination",
    copy: "Logistics, activities and day-to-day organisational coordination.",
  },
  {
    title: "Records & Governance",
    copy: "Member records, livestock records, documentation, reporting and oversight.",
  },
] as const;
