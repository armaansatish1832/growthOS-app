import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { restaurantData } = body;

    if (!restaurantData) {
      return NextResponse.json({ success: false, error: 'No data provided' }, { status: 400 });
    }

    const systemPrompt = `You are GrowthOS AI, an expert restaurant growth analyst with deep knowledge of Zomato and Swiggy metrics. You think exactly like a senior Key Accounts Manager who has managed 150+ restaurants in Delhi.

Your benchmarks:
- Restaurant Card CTR: Below 2% is bad, above 4% is strong
- Menu Conversion Rate (Orders divided by Page Opens x 100): Below 10% is bad, 15-20% is good
- Cancellation Rate: Above 1% is bad, 0% is ideal
- Returning User %: Below 15% means poor food or service, 30-40% is healthy
- ATV: Should be 20-30% higher than cheapest main course
- Recent Rating: Below 3.8 is critical, above 4.2 is strong

GMV Formula: CTR gets them in the door. Conversion gets the order. ATV makes the order valuable. Low Cancellations keeps the platform happy. Ratings ensures they come back.

You MUST respond with ONLY a valid JSON object. No markdown. No backticks. No extra text. Just raw JSON.

Use this exact structure:
{"overallScore":75,"summary":"Your summary here","leaks":[{"severity":"critical","metric":"Metric name","current":"current value","benchmark":"benchmark value","impact":"impact estimate","problem":"what is wrong","cause":"why it is happening","fix":"exact fix to apply"}],"topWins":["win 1","win 2","win 3"],"weeklyPriority":"most important action this week"}`;

    const conversionRate = (parseFloat(restaurantData.orders) / parseFloat(restaurantData.pageOpens) * 100).toFixed(1);

    const userMessage = `Analyse this restaurant and find all revenue leaks:

Restaurant: ${restaurantData.restaurantName}
Platform: ${restaurantData.platform}
Period: ${restaurantData.period}

METRICS:
- Impressions: ${restaurantData.impressions}
- CTR: ${restaurantData.ctr}%
- Page Opens: ${restaurantData.pageOpens}
- Orders: ${restaurantData.orders}
- Menu Conversion Rate: ${conversionRate}%
- GMV: Rs ${restaurantData.gmv}
- ATV: Rs ${restaurantData.atv}
- Cancellation Rate: ${restaurantData.cancellationRate}%
- Rating: ${restaurantData.rating}
- New Users: ${restaurantData.newUserPercent}%
- Returning Users: ${restaurantData.returningUserPercent}%

Return ONLY valid JSON with no extra text.`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
      } as Record<string, string>,
      body: JSON.stringify({
        model: 'claude-sonnet-4-5',
        max_tokens: 2000,
        system: systemPrompt,
        messages: [{ role: 'user', content: userMessage }],
      }),
    });

    const data = await response.json();

    if (!data.content || !data.content[0]?.text) {
      return NextResponse.json({ success: false, error: 'No AI response', details: data });
    }

    const rawText = data.content[0].text.trim();

    let auditResult;
    try {
      auditResult = JSON.parse(rawText);
    } catch {
      return NextResponse.json({ success: false, error: 'Could not parse AI response', raw: rawText });
    }

    return NextResponse.json({ success: true, audit: auditResult });

  } catch (error) {
    return NextResponse.json({ success: false, error: 'Server error', details: String(error) });
  }
}
