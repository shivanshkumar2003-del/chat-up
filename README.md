
# Mental Health Chat Up

A peer-to-peer mental health support application powered by Gemini AI.

## How to Deploy (Free)

This app cannot be hosted on Google Drive. Use Vercel:

1. **Push to GitHub**:
   - Upload all files to a GitHub repository.

2. **Deploy on Vercel**:
   - Go to [Vercel.com](https://vercel.com) and import your repository.
   - **IMPORTANT**: In the "Environment Variables" section, add:
     - Key: `API_KEY`
     - Value: `[Your Google Gemini API Key]`
   - Click **Deploy**.

## Troubleshooting
If you see a white screen:
1. Check Vercel Logs.
2. Ensure you added the `API_KEY` in Vercel Settings.
3. Ensure `vite.config.ts` has `base: './'`.
