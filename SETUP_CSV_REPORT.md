# CSV Report Dashboard - Setup & User Guide

## What's New ✨

Your Performance Dashboard now:
1. ✅ **Uploads CSV files** (Campaigns, Ad sets, Ads)
2. ✅ **Extracts metrics** automatically from the data
3. ✅ **Sends to Gemini AI** for insights & recommendations
4. ✅ **Generates reports** in "Trader Deekay campaigns" style
5. ✅ **Stores HTML reports** in Firestore
6. ✅ **Displays beautiful reports** in the dashboard

## Quick Setup

### Step 1: Add Gemini API Key

Open `index.html` and find this line (~1920):
```javascript
const GEMINI_API_KEY = 'YOUR_GEMINI_API_KEY_HERE';
```

Replace with your actual key from [Google AI Studio](https://aistudio.google.com/app/apikey):
```javascript
const GEMINI_API_KEY = 'AIzaSyD...your_actual_key...';
```

### Step 2: Prepare Your CSV Files

You need **exactly 3 CSV files** (Facebook Ads export format):

1. **Campaigns CSV**
   - Filename should contain: `campaign` or `campaigns`
   - Columns: Campaign name, Amount spent (SGD), Leads, Cost per lead (SGD), Impressions, CTR (all), Landing page views

2. **Ad Sets CSV**
   - Filename should contain: `ad-set` or `adset`
   - Columns: Ad set name, Amount spent (SGD), Leads, Cost per lead (SGD)

3. **Ads CSV**
   - Filename should contain: `ad` (but not `set` or `campaign`)
   - Columns: Ad name, Ad set name, Amount spent (SGD), Leads, Cost per lead (SGD)

**Example filenames:**
- `Tradezen-2-Campaigns-Sep-25-2026-Sep-28-2026.csv`
- `Tradezen-2-Ad-sets-Sep-25-2026-Sep-28-2026.csv`
- `Tradezen-2-Ads-Sep-25-2026-Sep-28-2026.csv`

### Step 3: Use the Dashboard

1. Click **"Performance Dashboard"** tab
2. Click **"+ Create Project"**
3. Enter project name (e.g., "September Campaign")
4. Click **"Create Project"**
5. Click **"Open"** on your new project
6. Select your 3 CSV files
7. Click **"Upload & Analyze"**
8. **See your report!** ✅

## Report Format

The generated report looks like `Trader Deekay campaigns.html` with:

### Header Section
- Project name
- Date & description
- Professional styling

### Big Numbers
- Total Spend (SGD)
- Total Leads Generated
- Average Cost Per Lead

### Campaign Comparison
- Side-by-side campaign performance
- Spend, leads, and CPL for each
- Key insights for each campaign

### Conversion Funnel
- Impressions → Clicks → Page Views → Conversions
- Shows conversion rates at each stage
- Identifies bottlenecks

### Budget Breakdown
- Where money was spent (top 5 ad sets)
- Bar charts showing spend distribution

### Top Performing Ads
- Best CPL ads ranked
- Spend, leads, CPL breakdown
- Recommendations for each

### Performance Scorecard
- ✓ What's Working Well
- ⚠ Needs Attention
- ⏸ Paused Campaigns

### Gemini AI Insights
- Summary of performance
- Key takeaways
- Funnel analysis
- Top performer insights
- Next steps & recommendations

## Data Flow

```
Upload CSV Files
        ↓
Parse CSV Data
        ↓
Extract Metrics (totals, comparisons, funnel)
        ↓
Send Summary to Gemini AI
        ↓
Gemini Returns: Insights, Scorecard, Next Steps
        ↓
Generate HTML Report (Trader Deekay Style)
        ↓
Store in Firestore
        ↓
Display in Dashboard
```

## CSV Column Requirements

### Campaigns CSV (Required Columns)
- `Campaign name` - Name of the campaign
- `Amount spent (SGD)` - Total spend
- `Leads` - Number of leads generated
- `Cost per lead (SGD)` - Calculated CPL
- `Impressions` - Number of impressions
- `CTR (all)` - Click-through rate %
- `Landing page views` - Page views from clicks

### Ad Sets CSV (Required Columns)
- `Ad set name` - Name of the ad set
- `Amount spent (SGD)` - Total spend
- `Leads` - Number of leads
- `Cost per lead (SGD)` - Calculated CPL

### Ads CSV (Required Columns)
- `Ad name` - Name of the ad
- `Ad set name` - Associated ad set
- `Amount spent (SGD)` - Total spend
- `Leads` - Number of leads
- `Cost per lead (SGD)` - Calculated CPL

## How Gemini AI is Used

1. **Metrics Extraction** → CSV data extracted (amounts, leads, CPL, impressions, CTR)
2. **Summary Creation** → Human-readable summary of all metrics
3. **AI Analysis** → Gemini analyzes:
   - Overall performance summary
   - Key takeaways
   - Funnel analysis insights
   - Why top ads perform well
   - What needs attention
   - What's working well
   - 4-5 recommended next steps

4. **Report Generation** → Combines CSV metrics + Gemini insights into HTML

## Example Metrics Extracted

From the CSVs, the system automatically calculates:

- **Total Spend** - Sum of all campaign spend
- **Total Leads** - Sum of all leads
- **Average CPL** - Total spend ÷ Total leads
- **Total Impressions** - Sum of all impressions
- **Average CTR** - Average click-through rate
- **Campaign Comparison** - Performance metrics per campaign
- **Top Ad Sets** - Best-spending ad sets ranked by ROI
- **Top Ads** - Best-performing ads by CPL
- **Conversion Funnel** - Impressions → Conversions flow

## Troubleshooting

### Report shows no data
- Check CSV filenames contain "campaign", "ad-set", "ad"
- Verify all required columns exist in CSVs
- Make sure numeric values are not quoted as text

### Gemini insights not appearing
- Verify API key is set correctly in `index.html`
- Check browser console (F12) for errors
- Ensure you have API quota remaining

### Wrong data extracted
- Check that column names exactly match Facebook Ads export format
- Verify CSV files are comma-separated (not semicolon)
- Ensure no special characters in filenames that break parsing

## Features

✅ Parse 3 different CSV file types  
✅ Automatic metric extraction  
✅ Gemini AI insights & recommendations  
✅ Professional "Trader Deekay" style reports  
✅ Conversion funnel analysis  
✅ Budget breakdown visualization  
✅ Top ad identification  
✅ Performance scorecard  
✅ Store reports in Firestore  
✅ Mobile responsive design  
✅ Re-open projects anytime to view reports  

## Files Modified

- `index.html` - Added CSV parsing, metric extraction, Gemini integration, HTML report generation

## Notes

- Reports are stored as HTML in Firestore for fast loading
- CSV files are parsed client-side (no server needed)
- Gemini API key should be from personal project (not shared)
- Free Gemini tier: 60 requests/minute, 1.5M tokens/month
- Each report generation = 1 Gemini API request

Enjoy your new CSV report dashboard! 🚀
