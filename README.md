

# SalesPulse AI CRM

**Supercharge your sales process with an intelligent, AI-powered CRM designed for the modern sales team.**

SalesPulse AI is a comprehensive CRM platform that leverages the power of the Google Gemini API to streamline lead generation, automate personalized outreach, and provide deep sales intelligence. It's an all-in-one solution for finding prospects, engaging them with tailored content, and analyzing your performance.

---

## ✨ Core Features

*   **📈 Dashboard:** Get a high-level overview of your sales metrics, pipeline, and lead sources at a glance.
*   **🔭 Advanced Lead Generation:** Discover new leads with an AI-powered market researcher that finds companies and key executives based on specific criteria (location, industry, company size).
*   **🤖 AI Sales Enablement:** Instantly generate complete outreach plans for new leads, including talking points, recommended products, personalized emails, and a multi-touch LinkedIn message sequence.
*   **👥 AI-Enriched Prospect Management:** Manage your contacts in a smart, centralized database. Enrich prospect profiles with a single click to get AI-powered insights on communication style, pain points, recent company news, and suggested next steps.
*   **🎯 Multi-Channel Campaign Automation:** Build and launch sophisticated outreach sequences that blend multiple touchpoints, including **Emails**, **LinkedIn Messages**, **WhatsApp**, **Phone Calls**, and manual **Tasks**.
*   **⚙️ Email Automation:** Create simple "if-this-then-that" rules to automatically send specific email templates when a prospect's status changes.
*   **✍️ AI Content Generator & Personalization Engine:** Craft compelling sales copy for emails, subject lines, and follow-ups. Within campaigns, the AI dynamically personalizes email templates for each prospect using real-time web research.
*   **📧 Integrated Email Inbox:** Manage your sales communications without leaving the app.
*   **📊 Analytics & Reporting:** Dive deep into your sales data with detailed reports on performance, funnel conversion, and team leaderboards.

---

## 🚀 User Guide: A Typical Workflow

Follow this workflow to get the most out of SalesPulse AI CRM.

### Step 1: Discover New Leads

1.  Navigate to the **Lead Generation** view.
2.  Use the **Advanced Market Researcher** to define your ideal customer profile. Enter criteria like `City`, `Industry`, `Company Size`, and `Executive Level`.
3.  Click **Start Research**. The AI will use Google Search to find real companies and decision-makers that match your query, populating a master data table with contact information and company details.

### Step 2: Generate an AI-Powered Outreach Plan

1.  In the research results table, find a promising lead and click on their row to expand the **Sales Enablement** panel.
2.  Click **Generate Outreach Plan**. The AI will analyze the prospect's company in real-time and create:
    *   Key talking points.
    *   A fully personalized email draft.
    *   A sequence of three personalized LinkedIn messages.

### Step 3: Add and Enrich Your Prospects

1.  Select the leads you want to pursue from the research results.
2.  Click **Add to Prospects**. The selected leads will now appear in the **Prospects** view.
3.  In the Prospects view, click on any prospect to open the **Prospect Intelligence Panel**.
4.  If the prospect is not already enriched, click **Enrich with AI**. The system will generate a detailed profile including:
    *   Likely communication style, motivations, and pain points.
    *   Recent company news and signals.
    *   AI-suggested "Next Best Actions" to move the conversation forward.

### Step 4: Build and Launch a Campaign

1.  Go to the **Campaigns** view.
2.  Create your email templates in the **Email Templates** section. Use merge tags (e.g., `{{first_name}}`, `{{recent_achievement}}`) to mark areas for AI personalization.
3.  Click **Create Campaign** and give it a name.
4.  Click on your new campaign to open the editor. In the **Sequence** tab, build your outreach cadence:
    *   Click **Add Step** to choose from Email, LinkedIn, WhatsApp, Call, or Task.
    *   For Email steps, select a template.
    *   For manual steps (LinkedIn, etc.), write your message or script directly in the editor.
    *   Adjust the delay (in days) between each step.
5.  Switch to the **Prospects** tab to add your target prospects to the campaign.
6.  When you're ready, return to the main Campaigns screen and click **Start Campaign**!

### Step 5: Monitor and Analyze

*   Use the **Dashboard** for a quick check on your key performance indicators.
*   Visit the **Analytics** view for in-depth reports on your sales funnel, team performance, and deal sources.

---

## 🛠️ Technical Overview

*   **Frontend:** Built with React, TypeScript, and styled with Tailwind CSS.
*   **AI Engine:** Powered by the **Google Gemini API**. It handles all generative tasks, including:
    *   Market research and lead discovery.
    *   Prospect analysis and insight generation.
    *   Personalized content creation for emails and messages.
*   **Charts:** Data visualizations are rendered using the Recharts library.

---

## 💻 Setup for Local Development

To run this project locally, follow these steps:

1.  **Prerequisites:** Ensure you have Node.js and a package manager (like npm or yarn) installed.

2.  **Clone the repository:**
    ```bash
    git clone [repository-url]
    cd salespulse-ai-crm
    ```

3.  **Install dependencies:**
    ```bash
    npm install
    ```

4.  **Set up Environment Variables:**
    This project requires an API key for the Google Gemini API. Create a `.env` file in the root of the project and add your key:
    ```
    API_KEY=YOUR_GEMINI_API_KEY
    ```

5.  **Run the application:**
    ```bash
    npm start
    ```
    The application should now be running on your local development server.
