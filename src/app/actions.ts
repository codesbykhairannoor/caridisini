'use server';

import prisma from "@/lib/prisma";
import axios from "axios";
import * as cheerio from "cheerio";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import fs from "fs/promises";
import path from "path";
import { chromium } from "playwright";

export async function addProduct(formData: FormData) {
  const title = formData.get('title') as string;
  const imageUrl = formData.get('imageUrl') as string;
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
      imageUrl,
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
  const imageUrl = formData.get('imageUrl') as string;
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
      imageUrl,
      originalPrice: originalPrice || null,
      price,
      shopeeUrl,
      categoryId
    }
  });

  revalidatePath('/');
  revalidatePath('/admin');
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

// Unified data extractor from HTML content using Cheerio
function extractMetadata($: cheerio.CheerioAPI) {
  const getMeta = (prop: string) => $(`meta[property="${prop}"]`).attr('content') || 
                                   $(`meta[name="${prop}"]`).attr('content');
  
  const title = getMeta('og:title') || $('title').text() || "";
  const imageUrl = getMeta('og:image') || "";
  let price = "";
  let categoryName = "";

  // Extract from LD+JSON
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const json = JSON.parse($(el).html() || "{}");
      if (json["@type"] === "Product") {
        const p = json.offers?.price || (Array.isArray(json.offers) ? json.offers[0].price : "");
        if (p) price = parseFloat(p).toLocaleString('id-ID').replace(',00', '');
      }
      if (json["@type"] === "BreadcrumbList") {
        const items = json.itemListElement;
        if (items && items.length > 1) {
          // The last item is the product title, we want the one before it
          const relevantItem = items[items.length - 2];
          categoryName = relevantItem.name || (relevantItem.item && relevantItem.item.name) || "";
        }
      }
    } catch (e) {}
  });

  // Fallback for price
  if (!price) {
    const desc = getMeta('description') || "";
    const match = desc.match(/Rp\s?([0-9.,]+)/i);
    if (match) price = match[1].replace(/[,.]00$/, '');
  }

  return {
    title: title.split(' | ')[0].trim(),
    imageUrl,
    price,
    categoryName
  };
}

export async function scrapeProductData(url: string) {
  const finalUrl = await resolveUrl(url);
  
  // --- STAGE 1: FAST SCRAPE (AXIOS) ---
  try {
    const response = await axios.get(finalUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Referer': 'https://shopee.co.id/'
      },
      timeout: 5000
    });

    const $ = cheerio.load(response.data);
    const data = extractMetadata($);

    if (data.title && data.imageUrl && !data.title.toLowerCase().includes('login')) {
      return { success: true, data };
    }
  } catch (err) {
    console.log("Stage 1 failed, moving to Stage 2...");
  }

  // --- STAGE 2: DEEP SCAN (PLAYWRIGHT) ---
  let browser;
  try {
    browser = await chromium.launch({ 
      headless: true,
      args: ['--disable-blink-features=AutomationControlled', '--no-sandbox']
    });
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
    });
    const page = await context.newPage();
    
    // Stealth injection
    await page.addInitScript(() => {
       Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
    });

    await page.goto(finalUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    
    // Wait for core content or meta tags to render
    await page.waitForTimeout(3000); 
    
    const html = await page.content();
    const $ = cheerio.load(html);
    const data = extractMetadata($);

    if (!data.title || data.title.toLowerCase().includes('login')) {
      throw new Error("Blocked by Shopee Wall");
    }

    return { success: true, data };
  } catch (error: any) {
    console.error('Hybrid Scraper Error:', error.message);
    return {
      success: false,
      error: 'Shopee memblokir akses otomatis. Silakan masukkan data secara manual.'
    };
  } finally {
    if (browser) await browser.close();
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
const ADMIN_EMAIL = "admin@caridisni.com";
const ADMIN_PASS = "admin123";
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
