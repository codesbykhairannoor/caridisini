import { NextRequest, NextResponse } from 'next/server';
import { FB_PIXEL_ID } from '@/lib/fpixel';
import { cookies, headers } from 'next/headers';

const META_ACCESS_TOKEN = process.env.META_ACCESS_TOKEN || "EAAW4ZCYobuK0BRAYLk2n2jV2kTIclGJmsThnXNLpWYsPlqSzFj0mqo48blnleiVflXctRVOPfsRv3SGM3clg2ZA96bXxBjTteyKon4ShHgtLEwZC8RrGEvYa1ZCpSANCPDFoQZA02KtN79WdmS3sr7GZABZCbXvVYv26KtmsqYmndhq2CFByCsXrSxPUZBMmkphSgwZDZD";
const META_TEST_EVENT_CODE = process.env.NEXT_PUBLIC_META_TEST_CODE || "TEST56548"; // Set to null/empty in production

export async function POST(req: NextRequest) {
  try {
    const { eventName, eventID, customData, userDataOverride } = await req.json();

    const headersList = await headers();
    const cookieStore = await cookies();
    
    // Identifiers
    const ipAddress = headersList.get('x-forwarded-for')?.split(',')[0] || headersList.get('x-real-ip') || '127.0.0.1';
    const userAgent = headersList.get('user-agent') || 'Unknown';
    const fbp = cookieStore.get('_fbp')?.value;
    const fbc = cookieStore.get('_fbc')?.value;
    const externalId = cookieStore.get('external_id')?.value;

    const eventData = {
      data: [
        {
          event_name: eventName,
          event_time: Math.floor(Date.now() / 1000),
          event_id: eventID,
          action_source: "website",
          event_source_url: headersList.get('referer') || "https://caridisni.shop",
          ...(META_TEST_EVENT_CODE ? { test_event_code: META_TEST_EVENT_CODE } : {}),
          user_data: {
            client_ip_address: ipAddress,
            client_user_agent: userAgent,
            fbp,
            fbc,
            external_id: externalId,
            ...(userDataOverride || {})
          },
          custom_data: customData
        }
      ]
    };

    const response = await fetch(`https://graph.facebook.com/v19.0/${FB_PIXEL_ID}/events?access_token=${META_ACCESS_TOKEN}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventData)
    });

    const result = await response.json();
    
    return NextResponse.json({ success: !result.error });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
