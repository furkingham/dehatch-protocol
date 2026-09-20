import type { Project } from "@/types";
import type { Lang } from "@/lib/i18n";

// The project data in mockData.ts is written in Turkish. This overlay holds the English
// version of the translatable fields (milestones are matched by position).
interface ProjectText {
  tagline: string;
  description: string;
  howItWorks: string;
  milestones: { title: string; description: string }[];
}

const en: Record<string, ProjectText> = {
  "agrochain-ai": {
    tagline: "AI-powered agricultural finance connecting farmers with DeFi",
    description:
      "AgroChain AI democratizes access to finance for small-scale farmers in Turkey. We target 3 million farmers with no access to traditional banking. Our AI credit-scoring model analyzes soil quality, weather data and past harvest records to give farmers fair and fast financing. Our smart contracts on Stellar remove intermediaries and connect farmers directly with investors.",
    howItWorks:
      "Farmers sign up and enter their land details. Our AI model analyzes satellite images, soil sensors and weather data to produce a credit score. A Soroban smart contract triggers automatic repayment at harvest time. Investors release their funds milestone by milestone: when each stage is completed, the smart contract verifies it and unlocks the next tranche.",
    milestones: [
      { title: "MVP Development", description: "Core platform infrastructure and smart contracts" },
      { title: "Beta Launch", description: "Live test with 100 pilot farmers" },
      { title: "Scaling", description: "Expansion to 1,000 farmers and a mobile app" },
    ],
  },
  "medisync-chain": {
    tagline: "A healthcare blockchain that gives patients sovereignty over their data",
    description:
      "MediSync Chain decentralizes health records so patients keep full control of their own medical data. Hospitals and clinics can share data securely and anonymously. Patients decide exactly which doctor can see which record.",
    howItWorks:
      "Patient records are encrypted and uploaded to IPFS, and the access key is stored on the Stellar network. When a doctor requests access, the patient approves it in the mobile app. Patients can also sell anonymized data to research organizations. All access logs are recorded immutably on the blockchain.",
    milestones: [
      { title: "Protocol Design", description: "HIPAA-compliant data encryption protocol" },
      { title: "Pilot Hospital", description: "Pilot integration with 3 hospitals" },
      { title: "National Scale", description: "Rollout across Turkey" },
    ],
  },
  "edufund-dao": {
    tagline: "A community-governed fund that decentralizes student scholarships",
    description:
      "EduFund DAO brings transparency and community governance to higher-education scholarships. Token holders vote to select scholarship candidates and oversee how funds are used. Smart contracts on Stellar distribute scholarships automatically.",
    howItWorks:
      "Students apply to the DAO and present their academic record and project plans. Token holders review the candidates in a one-week voting period. Scholarships for the selected students are paid out automatically by school term. After graduation, an optional give-back mechanism helps the ecosystem grow.",
    milestones: [
      { title: "DAO Structure", description: "Governance token and voting mechanism" },
      { title: "First Scholarship Round", description: "Scholarships for 10 students" },
      { title: "University Partnerships", description: "MOUs signed with 5 universities" },
    ],
  },
  "greenwatt-defi": {
    tagline: "A platform that connects solar energy producers directly with investors",
    description:
      "GreenWatt DeFi lets rooftop solar panel owners tokenize their surplus electricity and sell it to investors. Every kWh is represented as a token and traded on the Stellar network.",
    howItWorks:
      "The panel owner connects smart meter data to the system. Surplus production is converted into kWh tokens automatically. Investors buy these tokens and become partners in energy production. Monthly income is distributed to token holders in USDC. The smart contract sets prices using the national grid price as a reference.",
    milestones: [
      { title: "Tokenization Model", description: "kWh token standard protocol" },
      { title: "Pilot Neighborhood", description: "Pilot test in 50 households in Izmir" },
      { title: "National Grid", description: "Integration with the national grid operator" },
    ],
  },
  "paylink-stellar": {
    tagline: "Cross-border payment infrastructure that settles in seconds for businesses",
    description:
      "PayLink Stellar lets small and medium-sized businesses make international payments in seconds over the Stellar network with minimal fees. It is 90% faster and 95% cheaper than the current SWIFT system.",
    howItWorks:
      "A business gets an API key and integrates it into its own system. Payment requests settle at the best rate through Stellar path payments. The recipient receives the payment in their local currency. The whole transaction completes in 3-5 seconds. Monthly summary reports and accounting integration are also provided.",
    milestones: [
      { title: "API Development", description: "RESTful payments API" },
      { title: "Bank Integration", description: "Integration with 3 Turkish banks" },
      { title: "EU Market", description: "SEPA-compatible EU payments" },
    ],
  },
  craftdao: {
    tagline: "An NFT marketplace connecting Turkish artisans with global collectors",
    description:
      "CraftDAO tokenizes traditional Turkish crafts (kilims, tiles, copperwork) as NFTs. The physical certificate of each piece is recorded on the blockchain. Artisans also earn royalties from secondary sales.",
    howItWorks:
      "When an artisan creates a piece, they receive a certificate with a QR code. Photos and metadata are uploaded to IPFS and the NFT is minted. When a collector buys the NFT, delivery of the physical piece is guaranteed by the smart contract. When the piece is resold, the artisan automatically earns a 5% royalty.",
    milestones: [
      { title: "NFT Standard", description: "Physical-to-digital artwork bridge protocol" },
      { title: "First Collection", description: "50 artisans, 200 pieces" },
      { title: "Global Market", description: "International collector network" },
    ],
  },
  studyfi: {
    tagline: "A knowledge-economy platform where students tokenize and earn from their notes",
    description:
      "StudyFi is a knowledge-economy platform where students share quality lecture notes and study materials in exchange for tokens. Note quality is decided by community voting, and highly rated content earns more.",
    howItWorks:
      "A student uploads their notes to the platform and sets a price. Buyers pay in USDC to access the content. If community voting raises the content's quality score, a bonus reward is paid automatically. The author keeps earning passive income from later sales.",
    milestones: [
      { title: "Platform MVP", description: "Content upload and purchase infrastructure" },
      { title: "Community Voting", description: "Quality rating system" },
      { title: "University Partnership", description: "Official content agreement with 5 universities" },
    ],
  },
  "carbon-ledger": {
    tagline: "A platform that tracks corporate carbon footprints transparently on the blockchain",
    description:
      "Carbon Ledger records organizations' carbon emissions immutably on the Stellar blockchain and makes carbon-credit trading easier. It automates ESG reporting.",
    howItWorks:
      "A company connects IoT sensors or enters data manually. Emission data is recorded on the blockchain and approved by independent verifiers. Surplus carbon credits can be sold to other companies. The annual ESG report is generated automatically and a verifiable link is shared with auditors.",
    milestones: [
      { title: "Data Protocol", description: "Emission recording standard" },
      { title: "Verifier Network", description: "Independent auditor integration" },
      { title: "Carbon Exchange", description: "Peer-to-peer credit trading platform" },
    ],
  },
  rentchain: {
    tagline: "A rental platform that brings tenants and landlords together with a trust contract",
    description:
      "RentChain moves rental agreements onto smart contracts and removes deposit disputes. Rent is paid automatically and the deposit is held in a neutral escrow.",
    howItWorks:
      "The landlord and tenant enter the agreement terms. The deposit is locked in a Stellar escrow. Rent is paid automatically each month, and the smart contract sends a warning if it is late. At move-out, if both sides confirm the condition, the deposit is returned instantly; in a dispute it goes to an arbitrator.",
    milestones: [
      { title: "Contract Template", description: "Smart contract with verified legal validity" },
      { title: "Pilot Tenants", description: "50 active rental agreements" },
      { title: "Arbitration System", description: "Dispute resolution mechanism" },
    ],
  },
  healthtoken: {
    tagline: "A Web3 wellness platform that rewards healthy habits",
    description:
      "HealthToken is a wellness platform where users earn tokens for sharing health data such as daily steps, sleep quality and diet tracking. Health insurers pay for anonymous access to this data.",
    howItWorks:
      "Users connect their smartwatch or phone sensors. They earn HTK tokens when daily goals are completed. Tokens can be spent at partner pharmacy and gym chains. Anonymous aggregated health data is sold to insurance companies, and the revenue is shared with users through a pool.",
    milestones: [
      { title: "Sensor Integration", description: "Apple Health and Google Fit connection" },
      { title: "Token Economy", description: "HTK token distribution mechanism" },
      { title: "Insurance Partnership", description: "Data agreements with 2 insurance companies" },
    ],
  },
  defreelance: {
    tagline: "A decentralized work platform with secure escrow between freelancers and clients",
    description:
      "DeFreelance brings the freelance economy to the Stellar network. Work agreements are written into smart contracts and payment is held in milestone-based escrow. Disputes are resolved by DAO governance.",
    howItWorks:
      "The client defines the project and locks the budget in escrow. The freelancer applies for the task and starts work once they agree. On each delivery, the locked funds are released once the client approves. The freelancer's portfolio becomes verifiable on the blockchain.",
    milestones: [
      { title: "Escrow Contract", description: "Milestone-based payment smart contract" },
      { title: "Dispute DAO", description: "Dispute resolution mechanism" },
      { title: "Mobile App", description: "iOS and Android launch" },
    ],
  },
  "tokenized-art": {
    tagline: "A platform that opens Turkish contemporary art to investment through fractional NFTs",
    description:
      "ArtVault splits expensive artworks into small shares so every investor can take part. You can own 1/1000 of a painting. When the artwork gains value, all shareholders gain.",
    howItWorks:
      "An artist or gallery brings an artwork to the platform. A valuation expert sets the price. The work is divided into 1,000 equal shares and put on sale as NFTs. The artwork is kept physically in secure storage. Once a year, a sale can be decided by the vote of all shareholders at an auction.",
    milestones: [
      { title: "Legal Framework", description: "Fractional ownership model compliant with capital markets rules" },
      { title: "First Collection", description: "Tokenization of 10 valuable artworks" },
      { title: "Gallery Partnerships", description: "Integration with the Istanbul gallery network" },
    ],
  },
  supplyflo: {
    tagline: "A blockchain-based tracking system that makes SME supply chains transparent",
    description:
      "SupplyFlo lets small manufacturers track their supply chain end to end. Product origin can be verified, which removes the counterfeit problem. B2B payments run automatically over Stellar.",
    howItWorks:
      "Each product is registered in the system during production with a QR code or RFID tag. The warehouse, carrier and retailer each add a record to the blockchain at every stage. Customers can see the whole journey of a product by scanning the QR code. B2B payments are triggered automatically when delivery is confirmed.",
    milestones: [
      { title: "QR Protocol", description: "Product tracking standard schema" },
      { title: "Pilot Factory", description: "Pilot integration with 3 SMEs" },
      { title: "Retail Chain", description: "Partnership with a large supermarket chain" },
    ],
  },
  "votex-dao": {
    tagline: "A platform that moves university student council elections to transparent blockchain voting",
    description:
      "VoteX DAO protects student council elections from manipulation. Every student votes anonymously and results are visible instantly. Organizing an election goes from weeks to days.",
    howItWorks:
      "The system integrates with the university's student identity verification. Each student receives a single-use vote token. The vote is cast, and its validity can be proven while the identity stays hidden (zero-knowledge proof). Results are counted instantly and anyone can verify them.",
    milestones: [
      { title: "ZK Proof Module", description: "Anonymous vote-proving system" },
      { title: "University Pilot", description: "A real election at one university" },
      { title: "National Platform", description: "Talks on integration with the higher education council" },
    ],
  },
  microinsure: {
    tagline: "A decentralized platform offering parametric insurance to gig-economy workers",
    description:
      "MicroInsure offers affordable micro-insurance to couriers, ride-hailing drivers and other gig workers. When damage occurs, the smart contract pays automatically with no manual claim needed.",
    howItWorks:
      "A worker buys daily insurance for the day they want to work (0.5-2 USDC). In case of an accident or illness, the platform verifies it and submits the health data or accident report to the smart contracts. When the conditions are met, compensation is paid instantly in USDC. The insurance pool is funded by investors, and their returns vary with the loss ratio.",
    milestones: [
      { title: "Parametric Model", description: "Automatic claim trigger system" },
      { title: "Insurance Pool", description: "Liquidity provider mechanism" },
      { title: "Regulator Approval", description: "Insurance regulator license" },
    ],
  },
};

/** Returns the project with its text fields in the requested language. */
export function localizeProject(project: Project, lang: Lang): Project {
  if (lang === "tr") return project;
  const t = en[project.slug];
  if (!t) return project;
  return {
    ...project,
    tagline: t.tagline,
    description: t.description,
    howItWorks: t.howItWorks,
    milestones: project.milestones.map((m, i) => ({
      ...m,
      title: t.milestones[i]?.title ?? m.title,
      description: t.milestones[i]?.description ?? m.description,
    })),
  };
}
