# Performance Dashboard with Gemini AI - Setup Guide

## What Changed

Your Performance Dashboard now has a **project-based workflow**:

1. **Create Projects** - Users can create performance projects (containers for data)
2. **Upload Excel Files** - Upload multiple Excel files to analyze together
3. **AI Analysis** - Gemini AI automatically analyzes all files and generates insights
4. **Dashboard View** - Display metrics, insights, and recommendations

## Setup Instructions

### Step 1: Get Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Click "Create API Key"
3. Copy your API key (it's free with usage limits)

### Step 2: Add API Key to Your Code

Open `index.html` and find this line (around line 1762):

```javascript
const GEMINI_API_KEY = 'YOUR_GEMINI_API_KEY_HERE';
```

Replace `YOUR_GEMINI_API_KEY_HERE` with your actual Gemini API key.

**Example:**
```javascript
const GEMINI_API_KEY = 'AIzaSyD...your_actual_key...';
```

### Step 3: Update Firestore Rules (Optional but Recommended)

If using Firestore, add a new collection called `projects`. Make sure your Firestore security rules allow reads/writes:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /events/{document=**} {
      allow read, write: if true;
    }
    match /projects/{document=**} {
      allow read, write: if true;
    }
  }
}
```

## How It Works

### User Workflow

1. **Click "+ Create Project"** 
   - Enter project name, description, and client
   - Project is created and stored in Firestore

2. **Upload Excel Files**
   - Select one or more `.xlsx` or `.xls` files
   - Click "Upload & Analyze"
   - System extracts data from Excel files

3. **AI Analysis**
   - Gemini AI reads the data
   - Generates:
     - **Metrics**: Key numbers (spend, impressions, conversions, ROI, etc.)
     - **Insights**: Patterns, what's working, what needs improvement
     - **Recommendations**: 5 specific actionable items

4. **View Results**
   - Dashboard shows metrics, insights, and recommendations
   - All data is saved to Firestore
   - Can re-open project anytime to view analysis

## Expected Excel Format

Your Excel files should have structured data with headers. Example:

| Campaign | Spend | Impressions | Clicks | Conversions |
|----------|-------|-------------|--------|-------------|
| Meta Q4  | 5000  | 50000       | 2500   | 250         |
| Google   | 3000  | 30000       | 1200   | 120         |

Gemini will automatically extract and analyze this data.

## Gemini API Limits (Free Tier)

- **60 requests per minute**
- **1.5M tokens per month**
- Each file analysis counts as 1 request

For production, you may want to upgrade to a paid tier if you exceed these limits.

## Troubleshooting

### "Gemini API error"
- Check your API key is correct
- Verify it's not revoked in Google AI Studio
- Check you have quota remaining

### "Failed to parse Gemini response"
- The file data might be too large
- Try uploading smaller files first
- Check browser console for error details

### Data not saving
- Verify Firestore is configured correctly
- Check browser console for database errors
- Make sure Firestore security rules allow writes

## Files Changed

- `index.html` - Added project UI, file upload, and Gemini integration

## Features

✅ Create multiple projects  
✅ Upload multiple files per project  
✅ Automatic Excel parsing  
✅ AI-powered analysis with Gemini  
✅ Save/load projects from Firestore  
✅ Display metrics, insights, and recommendations  
✅ Delete projects as needed  

## Future Enhancements

- Export analysis to PDF
- Schedule recurring analysis
- Compare multiple projects
- Custom Gemini prompts per project
- Historical comparison
