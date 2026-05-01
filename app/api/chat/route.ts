import { NextResponse } from 'next/server';
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const message = body.message;
    const apiKey = process.env.ANTHROPIC_API_KEY;
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: 'claude-opus-4-5', max_tokens: 500, system: 'You are GrowthOS AI. User is Armaan, seller on Zomato/Swiggy. GMV 8.4L, ROI 71, 3 leaks. Be concise.', messages: [{ role: 'user', content: message }] })
    });
    const data = await response.json();
    console.log("Anthropic response:", JSON.stringify(data));
    const text = data?.content?.[0]?.text ?? data?.error?.message ?? JSON.stringify(data);
    return NextResponse.json({ message: text });
  } catch(e) { return NextResponse.json({ error: String(e) }, { status: 500 }); }
}