
# Mental Health Chat Up

A peer-to-peer mental health support application supporting both AI Peers (Gemini) and Real Human Connection (Firebase).

## Quick Deployment (Netlify Drag & Drop)

1. **Generate the App Folder**:
   Open your terminal in this project folder and run:
   ```bash
   npm run build
   ```
   
2. **Locate the Folder**:
   After the command finishes, look in your project folder. You will see a **new folder named `dist`** created.
   *(This folder contains your finished website).*

3. **Upload**:
   - Go to [app.netlify.com/drop](https://app.netlify.com/drop).
   - Drag that **`dist`** folder onto the page.
   - Your site is now live!

## Development Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start local server:
   ```bash
   npm run dev
   ```

## Configuration

- **Firebase**: configured in `services/firebaseConfig.ts`.
- **AI (Gemini)**: Add your API key to a `.env` file as `VITE_API_KEY=...` before building if you want to use the AI features.
