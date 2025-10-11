# Tata Capital: AI-Powered Loan Sanctioning Prototype

An advanced multi-agent system simulating a seamless, end-to-end loan approval journey, from initial customer inquiry to automated sanction letter generation.

<br/>

[![Tata Capital Prototype Demo](https://img.youtube.com/vi/YOUR_YOUTUBE_VIDEO_ID/0.jpg)](https://youtu.be/Ic4-78fb1CQ)

## Key Deliverables

This prototype showcases a sophisticated, AI-driven approach to loan processing, built around a powerful multi-agent architecture. The system is designed to deliver a seamless, efficient, and intelligent customer experience.

- **Complete End-to-End Automation**: Demonstrates the entire customer lifecycle, from the initial chatbot conversation to the automated generation and delivery of the loan sanction letter.

- **Advanced Agentic Workflow**: A Master Agent orchestrates a team of specialized worker agents, ensuring a smooth and logical progression of tasks without manual intervention.

- **Human-like Conversational AI**: The chatbot flow is designed to understand customer intent, handle complex queries, and manage edge cases such as loan rejection or requests for additional document verification.

- **Realistic Simulation**: The system mimics a real-world financial environment using synthetic customer data, mocked APIs for CRM and credit checks, and simulated document uploads.

## The Multi-Agent System

The backbone of this prototype is its team of specialized AI agents, each with a distinct role, all under the control of a central Master Agent.

- **Master Agent**: The conductor of the orchestra. It controls the entire workflow, activates the appropriate agent at each stage, and ensures seamless data transfer and task completion between them.

- **Sales Agent**: The frontline of customer interaction. This agent engages customers through the chatbot, captures their loan requirements (amount, tenure, purpose), and persuasively negotiates interest rates to close the deal.

- **Verification Agent**: The gatekeeper of identity. It handles the KYC (Know Your Customer) process by verifying personal data (phone, address) against a dummy CRM database.

- **Underwriting Agent**: The core decision-making engine. This agent reviews the applicant's credit history, verifies salary slips against prescribed logic, and determines final eligibility. It has the authority to approve, reject, or flag an application for manual review.

- **Sanction Letter Generator**: The final step in the automated process. Once the Underwriting Agent grants approval, this component automatically generates a professional, downloadable PDF sanction letter with all the negotiated terms.

## Technology Stack

- **Framework**: Next.js (React)
- **Styling**: Tailwind CSS
- **Authentication**: Clerk
- **AI/LLM**: Groq, Google Gemini
- **UI Components**: Shadcn/UI, Tabler Icons
- **PDF Generation**: jsPDF

## Getting Started

### Prerequisites
- Node.js (v18 or later)
- npm or yarn

### 1. Installation

Navigate to the project directory and install the dependencies:

```bash
npm install
```

### 2. Environment Variables

Create a `.env.local` file in the root of the project and add your API keys:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# AI Services
GROQ_API_KEY=your_groq_api_key
GEMINI_API_KEY=your_gemini_api_key

# Finnhub API (for Stock Market page)
NEXT_PUBLIC_FINNHUB_API_KEY=your_finnhub_api_key
```

### 3. Running the Development Server

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.
