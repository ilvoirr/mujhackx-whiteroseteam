import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { message, conversationHistory, stage } = await req.json();

    // EVEN MORE FLEXIBLE INTENT: Trigger READY if user expresses intent to apply for any loan, or provides purpose
    const intentCompletion = await groq.chat.completions.create({
      messages: [
        { 
          role: 'system', 
          content: `
Analyze the customer's message.
Criteria for "READY":
- They say they want a personal loan, home loan, car loan, or any loan
- OR, they mention purpose (e.g., "wedding", "education", "purchase")
- OR, explicit keywords: "yes", "proceed", "apply", "continue", "go ahead", "start", "okay", "sure", "let's do it", "I want to apply"
If so, reply ONLY ONE WORD: "READY".
Otherwise reply ONLY ONE WORD: "CONTINUE".
`
        },
        { role: 'user', content: message }
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.3,
      max_tokens: 10
    });

    const intent = intentCompletion.choices[0]?.message?.content?.trim().toUpperCase() || 'CONTINUE';

    // Build conversation context for more natural responses
    const conversationContext = conversationHistory 
      ? conversationHistory.slice(-6).map((msg: any) => ({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.text
        }))
      : [];

    const systemPrompt = stage === 'sales' 
      ? `You are Raj, a friendly and professional Tata Capital loan specialist. Your goal is to understand customer needs and guide them naturally.

CONVERSATION STYLE:
- Be warm, conversational, and human-like (not robotic)
- Ask follow-up questions naturally
- Show genuine interest in helping
- Use empathy and personalization
- Avoid listing everything at once

GUIDELINES:
- If they ask about loan types, explain ONE type based on their context, then ask what they need
- When discussing rates/amounts, keep it conversational: "So you're looking at around 5 lakhs for education? That's great! We can offer competitive rates starting at 10.5%. How many years were you thinking for repayment?"
- Build rapport before pushing to application
- When they seem interested, suggest: "Would you like me to prepare a quick proposal with exact numbers?"
- Keep responses under 60 words unless explaining complex details

Remember: You're having a conversation, not reading a script.`
      : 'You are a helpful assistant.';

    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        ...conversationContext,
        { role: 'user', content: message }
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.8,
      max_tokens: 250
    });

    const response = completion.choices[0]?.message?.content || 'How can I help you today?';

    return NextResponse.json({ 
      message: response,
      intent: intent,
      shouldTransition: intent === 'READY'
    });
  } catch (error) {
    console.error('Groq API Error:', error);
    return NextResponse.json({ 
      message: "I apologize, but I'm having trouble connecting right now. Could you try again?" ,
      intent: 'CONTINUE',
      shouldTransition: false
    }, { status: 500 });
  }
}
