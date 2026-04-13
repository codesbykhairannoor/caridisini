'use client';

import { useEffect } from 'react';

export default function MetaParamBuilder() {
  useEffect(() => {
    const setCookie = (name: string, value: string, days: number) => {
      const date = new Date();
      date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
      const expires = "; expires=" + date.toUTCString();
      // Use .caridisini.shop for root domain persistence if on production
      const domain = window.location.hostname.includes('caridisini.shop') 
        ? "; domain=.caridisini.shop" 
        : "";
      document.cookie = name + "=" + (value || "") + expires + "; path=/" + domain + "; SameSite=Lax";
    };

    const getCookie = (name: string) => {
      const nameEQ = name + "=";
      const ca = document.cookie.split(';');
      for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
      }
      return null;
    };

    // 1. FBC Logic (Facebook Click ID)
    const urlParams = new URLSearchParams(window.location.search);
    const fbclid = urlParams.get('fbclid');
    
    if (fbclid) {
      const fbcValue = `fb.1.${Date.now()}.${fbclid}`;
      setCookie('_fbc', fbcValue, 30);
      console.log('[MetaParamBuilder] FBC Created/Updated:', fbcValue);
    }

    // 2. FBP Logic (Facebook Browser ID)
    let fbp = getCookie('_fbp');
    if (!fbp) {
      const randomNum = Math.floor(Math.random() * 1000000000);
      fbp = `fb.1.${Date.now()}.${randomNum}`;
      setCookie('_fbp', fbp, 30);
      console.log('[MetaParamBuilder] FBP Generated:', fbp);
    } else {
      console.log('[MetaParamBuilder] FBP Found:', fbp);
    }

  }, []);

  return null;
}
