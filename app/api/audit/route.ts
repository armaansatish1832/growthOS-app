import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  
  if (!apiKey) {
    return NextResponse.json({ success: false, error: 'API key missing' });
  }

  const body = await req.json();
  const { restaurantData } = body;

  if (!restaurantData) {
    return NextResponse.json({ success: false, error: 'No data provided' });
  }

  const prompt = `You are GrowthOS AI, an expert restaurant growth analyst. Analyse this restaurant data and return ONLY a JSON object with no extra text.

Benchmarks you know:
- CTR: below 2% bad, above 4% good
- Menu Conversion (orders/page opens x 100): below 10% bad, 15-20% good  
- Cancellation rate: above 1% bad, 0% ideal
- Returning users: below 15% bad, 30-40% good
- Rating: below 3.8 critical, above 4.2 strong

Restaurant: ${restaurantData.restaurantName}
Platform: ${restaurantData.platform}
Period: ${restaurantData.period}
Impressions: ${restaurantData.impressions}
CTR: ${restaurantData.ctr}%
Page Opens: ${restaurantData.pageOpens}
Orders: ${restaurantData.orders}
Menu Conversion: ${(Number(restaurantData.orders) / Number(restaurantData.pageOpens) * 100).toFixed(1)}%
GMV: Rs ${restaurantData.gmv}
ATV: Rs ${restaurantData.atv}
Cancellation Rate: ${restaurantData.cancellationRate}%
Rating: ${restaurantData.rating}
New Users: ${restaurantData.newUserPercent}%
Returning Users: ${restaurantData.returningUserPercent}%

Return this exact JSON structure with real analysis:
{"overallScore":75,"summary":"2 sentence summary","leaks":[{"severity":"critical","metric":"name","current":"value","benchmark":"target","impact":"Rs estimate","problem":"what is wrong","cause":"why","fix":"exact action"}],"topWins":["win1","win2","win3"],"weeklyPriority":"top action"}`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-5',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  const data = await response.json();

  if (!data.content?.[0]?.text) {
    return NextResponse.json({ success: false, error: 'No AI response', raw: data });
  }

  try {
    const audit = JSON.parse(data.content[0].text.trim());
    return NextResponse.json({ success: true, audit });
  } catch {
    return NextResponse.json({ success: false, error: 'Parse failed', raw: data.content[0].text });
  }
}
