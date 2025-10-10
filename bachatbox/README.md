# Tata Capital - AI-Powered Loan Sanctioning Prototype

This repository contains the prototype for Tata Capital's AI-powered loan sanctioning platform. It's a modern Next.js application that demonstrates a complete, end-to-end loan application and sanctioning process. The platform uses a sophisticated multi-agent system to simulate a real-world customer journey, from initial chatbot inquiry to the automated generation of a loan sanction letter.

## Project Overview

The core of this prototype is its ability to orchestrate multiple specialized AI agents to handle different stages of the loan application workflow. This provides a seamless and intelligent user experience, mimicking a conversation with a team of financial experts.

- **End-to-End Simulation**: The system demonstrates the entire customer lifecycle using synthetic data, mocked APIs, and simulated document uploads.
- **Conversational AI**: Emphasis is placed on a natural, human-like chatbot flow that understands user intent and manages various scenarios, including edge cases like loan rejection.
- **Agent Orchestration**: A master agent controls the workflow, delegating tasks to specialized worker agents for a seamless and efficient process.

## The Agentic Workflow

Our multi-agent system ensures that each part of the loan process is handled by a specialized expert:

- **Master Agent**: The central controller that manages the overall flow and facilitates communication between the other agents to ensure seamless task completion.

- **Sales Agent**: The first point of contact. This agent interacts with the customer via the chatbot, understands their loan requirements (amount, tenure, purpose), and persuasively negotiates interest rates to close the deal.

- **Verification Agent**: Handles the KYC (Know Your Customer) process. It verifies personal data such as phone number and address against a dummy CRM database, ensuring the applicant's identity is confirmed.

- **Underwriting Agent**: The decision-maker. This agent reviews the applicant's credit history, verifies salary slips, and determines loan eligibility based on a prescribed logic. It has the authority to approve, reject, or request further verification.

- **Sanction Letter Generator**: Upon approval from the Underwriting Agent, this automated component generates a formal PDF sanction letter detailing the loan terms.

## Technology Stack

- **Framework**: Next.js (React)
- **Styling**: Tailwind CSS
- **Authentication**: Clerk
- **AI/LLM**: Groq, Google Gemini
- **UI Components**: Shadcn/UI, Tabler Icons
- **PDF Generation**: jsPDF

## Getting Started

Follow these instructions to get the project running on your local machine.

### Prerequisites

- Node.js (v18 or later)
- npm or yarn

### 1. Installation

Navigate to the project directory and install the required dependencies:

```bash
npm install
```

### 2. Environment Variables

Create a `.env.local` file in the root of the project (`/bachatbox/bachatbox/.env.local`) and add the necessary API keys and Clerk credentials. These are required for the AI and authentication features to function correctly.

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

Once the dependencies are installed and the environment variables are set, you can start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Demonstration Flow

To experience the full end-to-end process:

1.  **Initial Interaction**: Start a conversation with the **Tata Loans Expert** chatbot.
2.  **Negotiation**: Interact with the Sales Agent to define your loan amount, tenure, and finalize the interest rate.
3.  **KYC Process**: The Verification Agent will guide you through the KYC process, where you'll provide your details.
4.  **Underwriting**: The Underwriting Agent will review your application. Based on the simulated logic, your loan will be approved or rejected.
5.  **Sanction Letter**: If approved, the Sanction Letter Generator will automatically create a downloadable PDF of your loan sanction letter.
