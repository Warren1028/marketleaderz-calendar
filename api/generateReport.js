// Vercel Serverless Function
// Calls Gemini API with smart model fallback strategy (avoids overloaded 3.8-flash)

module.exports = async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { projectName, csvContent } = req.body;

  // Validate inputs
  if (!projectName || !csvContent) {
    return res.status(400).json({ error: 'Missing projectName or csvContent' });
  }

  const prompt = `YOU ARE A MARKETING ANALYST. PARSE THIS CSV DATA AND GENERATE A PROFESSIONAL HTML REPORT.

CRITICAL: Follow the EXACT structure below. Every report MUST have this consistent layout:

MANDATORY STRUCTURE (IN THIS ORDER):
1. Header section: Project name, date range, brief intro
2. "The Big Numbers" (h2): 3 stat boxes with: Total Spend, Total Leads, Average Cost Per Lead
3. "Campaign Comparison" or "Performance by [Category]" (h2): Compare main groups side-by-side
4. "Are People Noticing the Ads?" / "Conversion Funnel" (h2): Show flow Impressions → Clicks → Landing Page Views → Conversions with percentages
5. "Where the Budget Went" (h2): Top 5 items ranked by spend with horizontal bar charts
6. "Top Performing Items" (h2): List best performers (by CPL or leads) with badges (green="Working Well", yellow="Watch")
7. "Simple Scorecard" (h2): Three sections: ✓ Working Well, ⚠ Needs Attention, 🔄 Paused/Struggling
8. "What We'll Do Next" (h2): 4-6 bullet points with actionable recommendations
9. Footer: Citation of data source and date

DESIGN (TRADER DEEKAY STYLE):
- Use CSS variables for colors: --ink, --sub, --line, --bg, --card, --good, --warn, --watch, --accent
- All colors: dark text on white/light gray background
- Green (#27ae60) for positive/working, Yellow/Orange (#e74c3c) for warnings, Gray (#95a5a6) for neutral
- Stat boxes: large bold numbers with labels below
- Compare boxes: two-column grid with line items
- Funnel: boxes connected with arrows showing flow
- Bars: horizontal bars with labels and values
- Ad cards: title, subtitle, mini-stats, description, action text in bold
- Pills: small colored badges for status
- Fully responsive (mobile-friendly)
- Professional system fonts
- Generous padding and spacing

EXTRACT FROM CSV:
- Sum totals for spend, leads, impressions
- Calculate: Cost Per Lead (Spend ÷ Leads), CTR, conversion rates
- Identify top 5 best performers and bottom performers
- Find trends: what's working, what needs attention
- Group by campaign/ad set if multiple groups exist

OUTPUT FORMAT:
- Return ONLY complete HTML starting with <!DOCTYPE html>
- Include closing </html> tag
- All CSS INSIDE <head><style> tags (NO external stylesheets)
- NO markdown code blocks, NO explanations outside HTML
- COMPREHENSIVE: aim for 2500+ tokens of actual HTML content

CSV Data to analyze:
${csvContent}

Project Name: ${projectName}

GENERATE THE REPORT NOW:`;

  try {
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

    console.log('=== Gemini Configuration Check ===');
    console.log('GEMINI_API_KEY present:', !!GEMINI_API_KEY);

    if (!GEMINI_API_KEY) {
      console.error('ERROR: GEMINI_API_KEY not configured!');
      return res.status(500).json({ error: 'Gemini API key not configured' });
    }

    // Smart Gemini model fallback strategy (3.5 to 3.8)
    const models = [
      'gemini-3.5-flash',      // Stable general purpose
      'gemini-3.6-flash',      // Good balance
      'gemini-3.7-flash',      // Newer option
      'gemini-3.8-flash'       // Latest (if available/not overloaded)
    ];

    console.log('\n=== Attempting Gemini Models ===');
    for (const model of models) {
      try {
        console.log(`🔄 Trying ${model}...`);
        const html = await callGeminiWithModel(GEMINI_API_KEY, prompt, model);
        console.log(`✓ ${model} succeeded!`);
        return res.status(200).json({ html });
      } catch (error) {
        console.error(`✗ ${model} failed:`, error.message);
      }
    }

    // All models failed
    throw new Error('All Gemini models failed');
  } catch (error) {
    console.error('\n=== FATAL ERROR ===');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    return res.status(500).json({
      error: error.message || 'Failed to generate report',
      details: process.env.NODE_ENV === 'development' ? error.toString() : undefined
    });
  }
}

// Gemini API wrapper
async function callGeminiWithModel(apiKey, prompt, model) {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMsg = errorData.error?.message || errorData.message || response.statusText;
      console.error(`${model} API response error:`, { status: response.status, error: errorMsg, fullError: errorData });
      throw new Error(`${model} failed: ${response.status} - ${errorMsg}`);
    }

    const data = await response.json();
    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
      console.error(`${model} returned empty content:`, data);
      throw new Error(`${model} returned no content`);
    }
    let html = data.candidates[0].content.parts[0].text;

    // Extract HTML if wrapped in markdown
    if (html.includes('```html')) {
      html = html.replace(/```html\n?/g, '').replace(/```\n?/g, '');
    } else if (html.includes('```')) {
      html = html.replace(/```\n?/g, '');
    }

    return html;
  } catch (error) {
    console.error(`Fallback model ${model} error:`, error);
    throw error;
  }
}