'use server';

import prisma from "@/lib/prisma";
import axios from "axios";
import * as cheerio from "cheerio";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import fs from "fs/promises";
import path from "path";
import { chromium } from "playwright";
import { generateProductContent } from "@/lib/ai";

export async function addProduct(formData: FormData) {
  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const imageUrl = formData.get('imageUrl') as string;
  const images = formData.get('images') as string; // Store as JSON string of array
  const originalPrice = formData.get('originalPrice') as string;
  const price = formData.get('price') as string;
  const shopeeUrl = formData.get('shopeeUrl') as string;
  const categoryName = formData.get('categoryName') as string;

  if (!title || !imageUrl || !price || !shopeeUrl) {
    throw new Error('Required fields are missing');
  }

  let categoryId = null;

  if (categoryName) {
    // Find or create category
    let category = await prisma.category.findUnique({
      where: { name: categoryName }
    });

    if (!category) {
      const slug = categoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      category = await prisma.category.create({
        data: { name: categoryName, slug }
      });
    }
    categoryId = category.id;
  }

  await prisma.product.create({
    data: {
      title,
      description,
      imageUrl,
      images,
      originalPrice: originalPrice || null,
      price,
      shopeeUrl,
      categoryId
    }
  });

  revalidatePath('/');
  revalidatePath('/admin');
}

export async function updateProduct(id: number, formData: FormData) {
  await serializeAuthCheck();

  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const imageUrl = formData.get('imageUrl') as string;
  const images = formData.get('images') as string;
  const originalPrice = formData.get('originalPrice') as string;
  const price = formData.get('price') as string;
  const shopeeUrl = formData.get('shopeeUrl') as string;
  const categoryName = formData.get('categoryName') as string;

  if (!title || !imageUrl || !price || !shopeeUrl) {
    throw new Error('Required fields are missing');
  }

  let categoryId = null;

  if (categoryName) {
    // Find or create category
    let category = await prisma.category.findUnique({
      where: { name: categoryName }
    });

    if (!category) {
      const slug = categoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      category = await prisma.category.create({
        data: { name: categoryName, slug }
      });
    }
    categoryId = category.id;
  }

  await prisma.product.update({
    where: { id },
    data: {
      title,
      description,
      imageUrl,
      images,
      originalPrice: originalPrice || null,
      price,
      shopeeUrl,
      categoryId
    }
  });

  revalidatePath('/');
  revalidatePath('/admin');
}

export async function getProduct(id: number) {
  return await prisma.product.findUnique({
    where: { id: Number(id) },
    include: { category: true }
  });
}

export async function getRecommendations(categoryId: number | null, excludeId: number) {
  if (categoryId) {
    const similar = await prisma.product.findMany({
      where: {
        categoryId,
        id: { not: excludeId }
      },
      take: 4,
      include: { category: true }
    });
    if (similar.length > 0) return similar;
  }
  
  // Fallback to latest products
  return await prisma.product.findMany({
    where: {
      id: { not: excludeId }
    },
    take: 4,
    orderBy: { createdAt: 'desc' },
    include: { category: true }
  });
}

export async function refreshProductData(id: number) {
  await serializeAuthCheck();

  const product = await prisma.product.findUnique({
    where: { id }
  });

  if (!product || !product.shopeeUrl) {
    throw new Error('Product not found');
  }

  const result = await scrapeProductData(product.shopeeUrl);
  if (!result.success || !result.data) {
    throw new Error(result.error || 'Failed to fetch new data');
  }

  const { title, description, imageUrl, images, price, originalPrice } = result.data;

  await prisma.product.update({
    where: { id },
    data: {
      title: title || product.title,
      description: description || product.description,
      imageUrl: imageUrl || product.imageUrl,
      images: images || product.images,
      price: price || product.price,
      originalPrice: originalPrice || product.originalPrice,
    }
  });

  revalidatePath('/');
  revalidatePath('/admin');
  revalidatePath(`/product/${id}`);
  
  return { success: true };
}

// Helper to resolve short links and follow redirects manually if needed
async function resolveUrl(url: string): Promise<string> {
  try {
    const response = await axios.get(url, {
      maxRedirects: 0,
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
    });
    return url;
  } catch (error: any) {
    if (error.response && error.response.status >= 300 && error.response.status < 400) {
      return error.response.headers.location || url;
    }
    return url;
  }
}

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:122.0) Gecko/20100101 Firefox/122.0'
];

// Unified data extractor from HTML content using Cheerio
function extractMetadata($: cheerio.CheerioAPI) {
  const getMeta = (prop: string) => $(`meta[property="${prop}"]`).attr('content') || 
                                   $(`meta[name="${prop}"]`).attr('content');
  
  const title = (getMeta('og:title') || $('title').text() || "").trim();
  const imageUrl = getMeta('og:image') || "";
  let description = getMeta('description') || "";
  let price = "";
  let originalPrice = "";
  let categoryName = "";
  let images: string[] = [];

  if (imageUrl) images.push(imageUrl);

  // Extract from LD+JSON
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const json = JSON.parse($(el).html() || "{}");
      if (json["@type"] === "Product") {
        // Handle Price & Range
        const offers = json.offers;
        if (offers) {
          if (offers["@type"] === "AggregateOffer") {
            const low = offers.lowPrice || offers.price;
            const high = offers.highPrice;
            if (low && high && low !== high) {
              const minStr = parseFloat(low).toLocaleString('id-ID').replace(',00', '');
              const maxStr = parseFloat(high).toLocaleString('id-ID').replace(',00', '');
              price = `${minStr} - ${maxStr}`;
              originalPrice = ""; 
            } else if (low) {
              price = parseFloat(low).toLocaleString('id-ID').replace(',00', '');
            }
          } else {
            const p = offers.price;
            if (p) price = parseFloat(p).toLocaleString('id-ID').replace(',00', '');
          }
        }
        
        if (json.image) {
          if (Array.isArray(json.image)) {
            images = [...new Set([...images, ...json.image])];
          } else {
            images = [...new Set([...images, json.image])];
          }
        }
        if (json.description) {
           description = json.description;
        }
      }
      if (json["@type"] === "BreadcrumbList") {
        const items = json.itemListElement;
        if (items && items.length > 1) {
          const relevantItem = items[items.length - 2];
          let name = relevantItem.name || (relevantItem.item && relevantItem.item.name) || "";
          if (name && name.length < 50 && name.toLowerCase() !== title.toLowerCase()) {
            categoryName = name;
          }
        }
      }
    } catch (e) {}
  });

  // Fallback for price from description regex
  if (!price) {
    const desc = getMeta('description') || "";
    const matches = [...desc.matchAll(/Rp\s?([0-9.,]+)/gi)];
    if (matches.length > 0) {
      price = matches[0][1].replace(/[,.]00$/, '');
      if (matches.length > 1) {
        const secondPrice = matches[1][1].replace(/[,.]00$/, '');
        if (secondPrice !== price) originalPrice = secondPrice;
      }
    }
  }

  // Price sanitization
  if (price && originalPrice) {
    const pVal = parseInt(price.replace(/\D/g, ''));
    const oVal = parseInt(originalPrice.replace(/\D/g, ''));
    if (pVal > oVal) {
      const temp = price;
      price = originalPrice;
      originalPrice = temp;
    }
  }

  return {
    title: title.split(' | ')[0].replace(/^jual\s+/i, '').trim(),
    description,
    imageUrl,
    images: JSON.stringify(images),
    price,
    originalPrice,
    categoryName
  };
}

export async function scrapeProductData(url: string) {
  console.log(`\n[Scraper v4] 🚀 Memulai pencarian untuk URL: ${url}`);
  
  // 1. Sanitize URL
  let cleanUrl = url.split('?')[0];
  if (url.includes('shope.ee')) cleanUrl = url; 

  console.log(`[Scraper] 🔗 URL Bersih: ${cleanUrl}`);
  
  const finalUrl = await resolveUrl(cleanUrl);
  console.log(`[Scraper] 📍 URL Final Terdeteksi: ${finalUrl}`);

  const randomUA = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
  
  // --- STAGE 1: AXIOS (FAST) ---
  console.log(`[Scraper] ⚡ Stage 1 (Axios): Mencoba akses cepat...`);
  try {
    const response = await axios.get(finalUrl, {
      headers: {
        'User-Agent': randomUA,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Referer': 'https://www.google.com/'
      },
      timeout: 8000
    });

    const $ = cheerio.load(response.data);
    const data = extractMetadata($);

    if (data.title && data.imageUrl && !data.title.toLowerCase().includes('shopee indonesia')) {
      console.log(`[Scraper] ✅ Stage 1 BERHASIL! Judul: ${data.title}`);
      return { success: true, data };
    }
    console.log(`[Scraper] ⚠️ Stage 1 Gagal: Data tidak lengkap atau dialihkan.`);
  } catch (err: any) {
    console.log(`[Scraper] ❌ Stage 1 BLOKIR! Status: ${err.response?.status || 'Unknown'}`);
  }

  // --- STAGE 2: PLAYWRIGHT (DEEP STEALTH) ---
  console.log(`[Scraper] 🕵️ Stage 2 (Playwright Stealth): Meluncurkan Browser...`);
  let browser;
  try {
    browser = await chromium.launch({ 
      headless: true,
      args: [
        '--disable-blink-features=AutomationControlled', 
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-web-security',
        '--disable-features=IsolateOrigins,site-per-process',
      ]
    });
    
    // Mobile Emulation
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1',
      deviceScaleFactor: 3,
      isMobile: true,
      hasTouch: true,
      locale: 'id-ID',
    });

    const page = await context.newPage();
    console.log(`[Scraper] 📱 Browser Mobile diluncurkan. Mengakses halaman...`);

    // Stealth Injection
    await page.addInitScript(() => {
       Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
       Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });
       // @ts-ignore
       navigator.chrome = { runtime: {} };
    });

    const referer = ['https://www.google.com/', 'https://www.facebook.com/', 'https://pinteres.com/'].sort(() => Math.random() - 0.5)[0];

    await page.setExtraHTTPHeaders({
       'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
       'Referer': referer,
       'Sec-Fetch-Dest': 'document',
       'Sec-Fetch-Mode': 'navigate',
       'Sec-Fetch-Site': 'cross-site',
       'Sec-Fetch-User': '?1',
       'Sec-Ch-Ua': '"Not A(Brand";v="99", "Google Chrome";v="121", "Chromium";v="121"',
       'Sec-Ch-Ua-Mobile': '?1',
       'Sec-Ch-Ua-Platform': '"Android"'
    });

    await page.goto(finalUrl, { waitUntil: 'domcontentloaded', timeout: 35000 });
    console.log(`[Scraper] ⏳ Menunggu render konten (3.5s)...`);
    
    await page.waitForTimeout(3500);
    
    const html = await page.content();
    
    // Detailed Captcha/Verify check
    const isCaptcha = html.toLowerCase().includes('captcha') || html.toLowerCase().includes('verify') || html.toLowerCase().includes('pencurian data');
    const isLogin = html.toLowerCase().includes('login') && !html.toLowerCase().includes('product');

    if (isCaptcha) {
      console.log(`[Scraper] 👮 TERDETEKSI CAPTCHA/BOT CHALLENGE!`);
      throw new Error("Shopee memblokir karena terdeteksi BOT (Captcha Muncul). Coba lagi nanti.");
    }

    if (isLogin) {
      console.log(`[Scraper] 🔑 TERDETEKSI REDIRECT LOGIN!`);
      throw new Error("Shopee mengalihkan ke halaman Login. IP Server mungkin sedang dibatasi.");
    }

    const $ = cheerio.load(html);
    const data = extractMetadata($);

    if (!data.title || data.title.toLowerCase().includes('shopee indonesia')) {
      console.log(`[Scraper] ⚠️ Konten Kosong atau Shopee Landing Page.`);
      throw new Error("Gagal mengekstrak data. Shopee memblokir konten produk.");
    }

    console.log(`[Scraper] 🏆 Stage 2 BERHASIL! Judul: ${data.title}`);
    return { success: true, data };
  } catch (error: any) {
    const errorMsg = error.message.includes('Timeout') ? "Waktu tunggu habis (Timeout). Koneksi ke Shopee lambat." : error.message;
    console.error(`[Scraper] 💀 ERROR:`, errorMsg);
    return {
      success: false,
      error: errorMsg || 'Shopee memblokir akses otomatis (Bot Protection).'
    };
  } finally {
    if (browser) await browser.close();
    console.log(`[Scraper] 🏁 Proses Berakhir.\n`);
  }
}

export async function deleteProduct(id: number) {
  await serializeAuthCheck(); // Security check
  await prisma.product.delete({
    where: { id }
  });
  revalidatePath('/');
  revalidatePath('/admin');
}

// AUTH ACTIONS
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@caridisni.com";
const ADMIN_PASS = process.env.ADMIN_PASS || "admin123";
const AUTH_COOKIE = "caridisni_session";

export async function login(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (email === ADMIN_EMAIL && password === ADMIN_PASS) {
    (await cookies()).set(AUTH_COOKIE, "true", { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7 // 1 week
    });
    return { success: true };
  }
  return { success: false, error: "Email atau Password salah!" };
}

export async function logout() {
  (await cookies()).delete(AUTH_COOKIE);
  revalidatePath('/');
}

export async function checkAuth() {
  return (await cookies()).has(AUTH_COOKIE);
}

async function serializeAuthCheck() {
  const isAuth = await checkAuth();
  if (!isAuth) throw new Error("Unauthorized");
}

export async function uploadFile(formData: FormData) {
  try {
    await serializeAuthCheck();
    const file = formData.get('file') as File;
    if (!file) throw new Error("No file uploaded");

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const filename = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    
    // Ensure dir exists
    await fs.mkdir(uploadDir, { recursive: true });
    
    const filePath = path.join(uploadDir, filename);
    await fs.writeFile(filePath, buffer);

    return { 
      success: true, 
      url: `/uploads/${filename}` 
    };
  } catch (error: any) {
    console.error('Upload error:', error.message);
    return { success: false, error: error.message };
  }
}

export async function generateAiOptimization(title: string, rawDescription: string) {
  await serializeAuthCheck();
  try {
    const result = await generateProductContent(title, rawDescription);
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
export async function trackProductClick(productId: number) {
  try {
    await prisma.product.update({
      where: { id: productId },
      data: {
        clicks: { increment: 1 }
      }
    });
    return { success: true };
  } catch (error: any) {
    console.error('Failed to track click:', error.message);
    return { success: false };
  }
}
