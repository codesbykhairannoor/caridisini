'use client';

import Cookies from 'js-cookie';

const WISHLIST_COOKIE_NAME = 'caridisni_wishlist';

export const getWishlist = (): number[] => {
  const cookie = Cookies.get(WISHLIST_COOKIE_NAME);
  try {
    return cookie ? JSON.parse(cookie) : [];
  } catch (e) {
    return [];
  }
};

export const addToWishlist = (productId: number) => {
  const wishlist = getWishlist();
  if (!wishlist.includes(productId)) {
    const newWishlist = [...wishlist, productId];
    Cookies.set(WISHLIST_COOKIE_NAME, JSON.stringify(newWishlist), { expires: 30, path: '/' });
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('wishlist-updated'));
    }
    return true;
  }
  return false;
};

export const removeFromWishlist = (productId: number) => {
  const wishlist = getWishlist();
  const newWishlist = wishlist.filter(id => id !== productId);
  Cookies.set(WISHLIST_COOKIE_NAME, JSON.stringify(newWishlist), { expires: 30, path: '/' });
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('wishlist-updated'));
  }
  return true;
};

export const isInWishlist = (productId: number): boolean => {
  return getWishlist().includes(productId);
};
