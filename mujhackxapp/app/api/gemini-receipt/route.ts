import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: NextRequest) {
  console.log('=== Receipt API Called ===');
  
  try {
    // Check API key first
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('❌ GEMINI_API_KEY is not set');
      return NextResponse.json({ 
        error: 'API key not configured',
        message: 'Please add GEMINI_API_KEY to your .env.local file'
      }, { status: 500 });
    }

    console.log('✅ API key found');

    const formData = await request.formData();
    const image = formData.get('image') as File;

    if (!image) {
      console.error('❌ No image in request');
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    console.log('✅ Image received:', {
      name: image.name,
      type: image.type,
      size: image.size
    });

    // Convert image to base64
    const imageBuffer = Buffer.from(await image.arrayBuffer());
    const base64Image = imageBuffer.toString('base64');
    
    console.log('✅ Image converted to base64');

    // Initialize Gemini with the CURRENT model (gemini-1.5 is deprecated as of Sept 2025)
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    
    console.log('✅ Gemini model initialized: gemini-2.5-flash');

    const prompt = `Analyze this receipt and extract information. Return ONLY a JSON object with this structure:
{
  "amount": 123.45,
  "type": "expense",
  "description": "Store Name",
  "category": "food",
  "confidence": 0.9
}

Rules:
- amount: total amount as a number (no currency symbols)
- type: always "expense"
- description: merchant/store name from the receipt
- category: must be one of: food, transport, shopping, entertainment, healthcare, utilities, other
- confidence: your confidence level from 0.0 to 1.0

Return ONLY the JSON object, no markdown formatting, no code blocks, no extra text.`;

    console.log('📤 Sending request to Gemini...');
    
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Image,
          mimeType: image.type,
        },
      },
    ]);

    const response = await result.response;
    const text = response.text();
    
    console.log('📥 Gemini response received');
    console.log('Raw response:', text);
    
    // Clean markdown
    let cleanText = text.replace(/``````\n?/gi, '').trim();
    console.log('Cleaned response:', cleanText);
    
    // Parse JSON
    let receiptData;
    try {
      receiptData = JSON.parse(cleanText);
    } catch {
      const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        receiptData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No valid JSON in response');
      }
    }
    
    console.log('✅ Parsed data:', receiptData);
    
    // Validate required fields
    if (!receiptData.amount || !receiptData.description) {
      console.error('❌ Missing required fields:', receiptData);
      return NextResponse.json({ 
        error: 'Incomplete data',
        message: 'Could not extract all required information from receipt'
      }, { status: 400 });
    }
    
    // Ensure proper types
    receiptData.amount = parseFloat(receiptData.amount);
    receiptData.type = receiptData.type || 'expense';
    receiptData.category = receiptData.category || 'other';
    receiptData.confidence = receiptData.confidence || 0.5;
    
    console.log('✅ SUCCESS - Final data:', receiptData);
    
    return NextResponse.json({ 
      message: 'Receipt processed successfully',
      receiptData: receiptData
    });

  } catch (error) {
    console.error('❌ ERROR:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    
    return NextResponse.json(
      { 
        error: 'Failed to process receipt',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
