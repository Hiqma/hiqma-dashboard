import { NextRequest, NextResponse } from 'next/server';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

async function callGemini(prompt: string) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.8,
          topK: 40,
          topP: 0.8,
          maxOutputTokens: 1000,
        }
      })
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Gemini API error:', errorText);
    throw new Error(`Gemini API failed: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  console.log('Gemini response:', JSON.stringify(data, null, 2));
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  console.log('Extracted text:', text);
  return text;
}

export async function POST(request: NextRequest) {
  try {
    const { content, title, action, language, location } = await request.json();
    
    if (!action) {
      return NextResponse.json({ error: 'Action is required' }, { status: 400 });
    }

    if (!GEMINI_API_KEY) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }

    let prompt = '';
    let result: any;

    switch (action) {
      case 'suggestions':
        prompt = `You are an educational content assistant for African educators. Analyze this content and provide 3-5 specific suggestions to improve it:

Content: ${content}

Focus on: grammar, clarity, age-appropriateness, cultural relevance, and engagement.
Provide as numbered list.`;
        
        const text = await callGemini(prompt);
        result = text
          .split('\n')
          .filter((line: string) => line.match(/^\d+\./))
          .map((line: string) => line.replace(/^\d+\.\s*/, '').trim());
        break;

      case 'continue':
        prompt = `You are a creative writer helping create educational content for African children. Continue this story naturally with the next page (200-300 words). Keep it engaging, age-appropriate, and culturally relevant:

Current content:
${content}

Write the next page that continues the story smoothly.`;
        
        result = await callGemini(prompt);
        break;

      case 'cover':
        prompt = `Create a detailed image generation prompt for a children's book cover based on this title and content. The prompt should be suitable for AI image generators like DALL-E or Midjourney:

Title: ${title}
Content preview: ${content?.substring(0, 500)}

Create a vivid, detailed prompt that describes:
- Main characters or subjects
- Setting and atmosphere
- Art style (colorful, child-friendly, African-inspired)
- Mood and emotions
- Specific visual elements

Provide only the image prompt, no explanations.`;
        
        result = await callGemini(prompt);
        break;

      case 'translate':
        if (!language) {
          return NextResponse.json({ error: 'Target language is required' }, { status: 400 });
        }
        
        prompt = `Translate this educational content to ${language}. Maintain the tone, style, and educational value. Keep it age-appropriate and culturally sensitive:

Content:
${content}

Provide only the translation, no explanations.`;
        
        result = await callGemini(prompt);
        break;

      case 'cultural':
        if (!location) {
          return NextResponse.json({ error: 'Cultural location is required' }, { status: 400 });
        }
        
        prompt = `You are a cultural consultant for African educational content. Suggest 3-5 ways to add authentic ${location} cultural elements to this story:

Content:
${content}

Suggest:
- Local traditions, customs, or practices
- Regional foods, clothing, or daily life details
- Local proverbs, sayings, or wisdom
- Cultural values or community practices
- Authentic names, places, or references

Provide as numbered list with brief explanations.`;
        
        const culturalText = await callGemini(prompt);
        result = culturalText
          .split('\n')
          .filter((line: string) => line.match(/^\d+\./))
          .map((line: string) => line.replace(/^\d+\.\s*/, '').trim());
        break;

      case 'questions':
        prompt = `Generate 5 comprehension questions based on this educational content. Create a mix of difficulty levels (easy, medium, hard) and question types:

Content:
${content}

For each question, provide in this exact format:
Q: [question]
Type: [multiple_choice/true_false/short_answer]
Difficulty: [easy/medium/hard]
Answer: [correct answer]
Options: [if multiple choice, provide 4 options separated by |]

Generate 5 questions.`;
        
        result = await callGemini(prompt);
        break;

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json({ result });
  } catch (error) {
    console.error('AI generation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate content' },
      { status: 500 }
    );
  }
}
