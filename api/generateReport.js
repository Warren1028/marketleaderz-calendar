// Vercel Serverless Function
// Calls Groq API (primary) or Gemini API (fallback) with environment variables

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

  const prompt = `CRITICAL: You must return ONLY HTML code with embedded CSS. No markdown, no explanation, no text before or after.

You are an expert marketing analyst. Analyze the CSV data below and generate a professional HTML performance report.

REQUIREMENTS:
1. Complete standalone HTML page with <!DOCTYPE html> and all CSS in <style> tag
2. Professional header with project name, date, and summary
3. Key metrics section with big numbers (total spend, leads, cost per lead, etc.)
4. Campaign/Ad Set performance comparison (tables or cards)
5. Conversion funnel analysis with visual representation
6. Top performing ads/campaigns ranked
7. Performance scorecard (what's working, needs attention)
8. Actionable next steps

DESIGN STYLE (Trader Deekay):
- Professional typography (system fonts)
- Color-coded badges: green for good, yellow/orange for attention, gray for neutral
- Use tables for data comparisons
- Clear section headers
- Responsive design that works on mobile
- Clean white/light background
- Professional spacing and padding

CRITICAL INSTRUCTIONS:
- Return ONLY valid HTML (starting with <!DOCTYPE html>)
- Include all CSS in <style> tags in the <head>
- Do NOT include markdown code blocks or backticks
- Do NOT include any text outside the HTML
- Make it a complete, working HTML page

CSV Data:
${csvContent}

Project Name: ${projectName}`;

  try {
    // Check what keys we have
    const GROQ_API_KEY = process.env.GROQ_API_KEY;
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

    console.log('=== API Configuration Check ===');
    console.log('GROQ_API_KEY present:', !!GROQ_API_KEY);
    console.log('GEMINI_API_KEY present:', !!GEMINI_API_KEY);

    if (!GROQ_API_KEY && !GEMINI_API_KEY) {
      console.error('ERROR: No API keys configured!');
      return res.status(500).json({ error: 'No API keys configured on server' });
    }

    // Try Groq first (faster, more reliable)
    if (GROQ_API_KEY) {
      console.log('\n=== Attempting Groq API ===');
      try {
        const html = await callGroqAPI(GROQ_API_KEY, prompt);
        console.log('✓ Groq API succeeded');
        return res.status(200).json({ html });
      } catch (groqError) {
        console.error('✗ Groq API failed:', groqError.message);
        console.log('Falling back to Gemini...');
      }
    }

    // Fallback to Gemini
    if (GEMINI_API_KEY) {
      console.log('\n=== Attempting Gemini API ===');
      const html = await callGeminiWithModel(GEMINI_API_KEY, prompt, 'gemini-3.8-flash');
      console.log('✓ Gemini API succeeded');
      return res.status(200).json({ html });
    }

    return res.status(500).json({ error: 'All API calls failed' });
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

// Call Groq API
async function callGroqAPI(apiKey, prompt) {
  const models = [
    'llama-3.3-70b-versatile',
    'llama-3.1-8b-instant',
    'openai/gpt-oss-120b',
    'openai/gpt-oss-20b'
  ];

  for (const model of models) {
    try {
      console.log(`🔄 Trying Groq model: ${model}`);

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: model,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.5,
          max_tokens: 3000
        })
      });

      console.log(`Response from ${model}:`, response.status);

      if (!response.ok) {
        const errorText = await response.text().catch(() => '{}');
        let errorData = {};
        try {
          errorData = JSON.parse(errorText);
        } catch (e) {
          errorData = { message: errorText };
        }

        const errorMsg = errorData.error?.message || errorData.message || response.statusText;
        console.error(`✗ ${model} failed: ${errorMsg}`);
        continue; // Try next model
      }

      const data = await response.json();
      console.log(`✓ ${model} succeeded!`);

      let html = data.choices?.[0]?.message?.content;
      if (!html) {
        throw new Error('No content in response');
      }

      // Extract HTML if wrapped in markdown
      if (html.includes('```html')) {
        html = html.replace(/```html\n?/g, '').replace(/```\n?/g, '');
      } else if (html.includes('```')) {
        html = html.replace(/```\n?/g, '');
      }

      return html;
    } catch (error) {
      console.error(`Groq ${model} error:`, error.message);
      // Continue to next model
    }
  }

  // All Groq models failed
  throw new Error('All Groq models failed. Falling back to Gemini.');
}

// Fallback function for Gemini models
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
      console.error(`${model} API error:`, errorData);

      // If 3.8 fails, try 3.6 as additional fallback
      if (model === 'gemini-3.8-flash' && (response.status === 503 || response.status === 429)) {
        console.log('3.8-flash busy, trying 3.6-flash...');
        return callGeminiWithModel(apiKey, prompt, 'gemini-3.6-flash');
      }

      throw new Error(`${model} failed: ${response.status}`);
    }

    const data = await response.json();
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

// Fallback function for Gemini models
async function callGeminiWithModel(apiKey, prompt, model) {
  try {
    console.log(`Trying ${model}...`);
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
      throw new Error(`${model} failed: ${response.status} - ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    let html = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!html) {
      throw new Error(`No content in ${model} response`);
    }

    // Extract HTML if wrapped in markdown
    if (html.includes('```html')) {
      html = html.replace(/```html\n?/g, '').replace(/```\n?/g, '');
    } else if (html.includes('```')) {
      html = html.replace(/```\n?/g, '');
    }

    console.log(`✓ ${model} succeeded`);
    return html;
  } catch (error) {
    console.error(`✗ ${model} error:`, error.message);
    throw error;
  }
}