# BachatBox - Personal Finance Assistant

BachatBox is a modern personal finance application that helps you track expenses, analyze spending patterns, and get AI-powered financial advice.

### Key Features

- **Expense Tracking**: Easily log and categorize your transactions
- **Financial Insights**: Get detailed analysis of your spending habits
- **AI-Powered Advice**: Receive personalized financial recommendations
- **Dashboard**: Visualize your financial health with interactive charts
- **Secure**: Your financial data is protected with industry-standard security

### Technology Stack

- **Next.js 14**: Modern React framework for server-side rendering
- **TypeScript**: For type-safe development
- **Tailwind CSS**: For styling and responsive design
- **Supabase**: Backend and database
- **Google Gemini API**: For AI-powered financial advice
- **Clerk**: For authentication and user management

### Getting Started

1. Clone the repository:
```bash
git clone git@github.com:ilvoirr/bachatbox.git
cd bachatbox
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory and add the following:
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Google Gemini
GEMINI_API_KEY=your_gemini_api_key
```

4. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

### Important Notes
- Never commit your `.env.local` file or any sensitive information to version control.
- Make sure to set up proper CORS policies if you're using external services.
- For production deployment, set up environment variables in your hosting provider's dashboard.

### Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
npm run dev
# or
yarn dev
```

5. Open your browser and navigate to [http://localhost:3000](http://localhost:3000)

### Project Structure

The project follows a clean and organized structure:

```
src/
├── app/              # Main application routes and pages
├── components/       # Reusable React components
├── lib/             # Utility functions and configurations
├── public/          # Static assets like images and fonts
└── data/            # Application data and configurations
```

### Key Components

- **NumberTicker**: A custom component that animates number changes smoothly
- **Confetti**: Adds celebratory visual effects for milestone achievements
- **HyperText**: Interactive text component with dynamic styling
- **ResultPage**: The main visualization page that shows progress
- **AppPage**: User interface for code input and goal setting

### API Endpoints

The application uses several API endpoints to handle data:

- **/api/get-score**: Calculates the alignment score based on user's code
- **/api/get-user-data**: Retrieves user's goals and code data
- **/api/save-data**: Saves user's progress and code submissions
- **/api/update-profile**: Updates user's profile information

### Contributing

We welcome contributions from the community! Here's how to get started:

1. Fork the repository on GitHub
2. Create a new feature branch:
```bash
git checkout -b feature/your-feature-name
```
3. Make your changes and commit them:
```bash
git commit -m 'Add your feature description'
```
4. Push your changes to your fork:
```bash
git push origin feature/your-feature-name
```
5. Create a Pull Request on the main repository

### License

This project is licensed under the MIT License - see the LICENSE file for details

### Support

For support, please open an issue in the GitHub repository or contact the maintainers directly
