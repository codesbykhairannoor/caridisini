import { NextRequest, NextResponse } from 'next/server';
import { FB_PIXEL_ID } from '@/lib/fpixel';
import { cookies, headers } from 'next/headers';
import crypto from 'crypto';

const META_ACCESS_TOKEN = process.env.META_ACCESS_TOKEN || "EAAW4ZCYobuK0BRAYLk2n2jV2kTIclGJmsThnXNLpWYsPlqSzFj0mqo48blnleiVflXctRVOPfsRv3SGM3clg2ZA96bXxBjTteyKon4ShHgtLEwZC8RrGEvYa1ZCpSANCPDFoQZA02KtN79WdmS3sr7GZABZCbXvVYv26KtmsqYmndhq2CFByCsXrSxPUZBMmkphSgwZDZD";

function hashData(data: string) {
  if (!data) return undefined;
  return crypto.createHash('sha256').update(data.trim().toLowerCase()).digest('hex');
}

function normalizePhone(phone: string) {
  if (!phone) return undefined;
  // Remove all non-digits
  let cleaned = phone.replace(/\D/g, '');
  // Force 62 prefix if it starts with 0
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.substring(1);
  } else if (!cleaned.startsWith('62')) {
    cleaned = '62' + cleaned;
  }
  return crypto.createHash('sha256').update(cleaned).digest('hex');
}

export async function POST(req: NextRequest) {
  try {
    const { eventName, eventID, customData, userDataOverride } = await req.json();

    const headersList = await headers();
    const cookieStore = await cookies();
    
    // Identifiers
    // Try to get IPv6 first if available in headers, fallback to standard
    const forwardedFor = headersList.get('x-forwarded-for');
    const ipAddress = forwardedFor ? forwardedFor.split(',')[0].trim() : (headersList.get('x-real-ip') || '127.0.0.1');
    const userAgent = headersList.get('user-agent') || 'Unknown';
    const fbp = cookieStore.get('_fbp')?.value;
    const fbc = cookieStore.get('_fbc')?.value;
    const externalId = cookieStore.get('external_id')?.value;

    // Normalization & Hashing
    const em = userDataOverride?.em ? hashData(userDataOverride.em) : undefined;
    const ph = userDataOverride?.ph ? normalizePhone(userDataOverride.ph) : undefined;

    if (em || ph) {
      console.log(`[CAPI] Hashed Data - em: ${em ? 'YES' : 'NO'}, ph: ${ph ? 'YES' : 'NO'}`);
    }

    const payload = {
      data: [
        {
          event_name: eventName,
          event_time: Math.floor(Date.now() / 1000),
          event_id: eventID,
          action_source: "website",
          event_source_url: headersList.get('referer') || "https://caridisni.shop",
          user_data: {
            client_ip_address: ipAddress,
            client_user_agent: userAgent,
            fbp,
            fbc,
            external_id: externalId,
            ...(userDataOverride || {}),
            em, // Overwrite with hashed value
            ph  // Overwrite with hashed value
          },
          custom_data: customData
        }
      ],
      // No test_event_code in production build
    };

    const response = await fetch(`https://graph.facebook.com/v19.0/${FB_PIXEL_ID}/events?access_token=${META_ACCESS_TOKEN}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    
    if (result.error) {
       console.error(`[CAPI Error] ${eventName}:`, JSON.stringify(result.error));
    } else {
       console.log(`[CAPI Success] ${eventName}:`, JSON.stringify(result));
    }
    
    return NextResponse.json({ success: !result.error, result });
  } catch (error: any) {
    console.error("[CAPI Critical Failure]:", error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
