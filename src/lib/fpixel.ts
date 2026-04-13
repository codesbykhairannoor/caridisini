export const FB_PIXEL_ID = '1474907194170192';

export const pageview = () => {
  if (typeof window !== 'undefined' && (window as any).fbq) {
    (window as any).fbq('track', 'PageView');
  }
};

// https://developers.facebook.com/docs/facebook-pixel/advanced/
export const event = (name: string, options = {}, eventID?: string) => {
  if (typeof window !== 'undefined' && (window as any).fbq) {
    (window as any).fbq('track', name, options, eventID ? { eventID } : undefined);
  }
};

export const generateEventId = (name: string) => {
  const cleanName = name.replace(/\s+/g, '').toLowerCase();
  return `cd-${cleanName}-${Date.now()}`;
};
