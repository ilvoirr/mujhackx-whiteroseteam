import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();

    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: 'You are a Tata Capital loan specialist. Help customers with loan queries. Keep responses under 80 words.' },
        { role: 'user', content: message }
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_tokens: 200
    });

    return NextResponse.json({ message: completion.choices[0]?.message?.content || 'How can I help you?' });
  } catch (error) {
    return NextResponse.json({ message: 'Service temporarily unavailable.' }, { status: 500 });
  }
}
