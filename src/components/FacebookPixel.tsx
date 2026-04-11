'use client';

import { useEffect, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import * as fpixel from '@/lib/fpixel';
import Script from 'next/script';

const FacebookPixelComponent = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    fpixel.pageview();
  }, [pathname, searchParams]);

  return (
    <>
      <Script
        id="fb-pixel"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            
            // Get external_id from cookie if exists
            const match = document.cookie.match(new RegExp('(^| )external_id=([^;]+)'));
            const external_id = match ? match[2] : undefined;
            
            fbq('init', '${fpixel.FB_PIXEL_ID}', external_id ? { external_id } : {});
            fbq('track', 'PageView');
          `,
        }}
      />
    </>
  );
};

export default function FacebookPixel() {
  return (
    <Suspense fallback={null}>
      <FacebookPixelComponent />
    </Suspense>
  );
}
