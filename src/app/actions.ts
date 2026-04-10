'use server';

import prisma from "@/lib/prisma";
import axios from "axios";
import * as cheerio from "cheerio";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import fs from "fs/promises";
import path from "path";
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

// Robust URL resolver to follow multi-stage redirects (e.g., s.shopee.co.id -> shopee.co.id)
async function resolveUrl(url: string): Promise<string> {
  let currentUrl = url;
  let depth = 0;
  const maxDepth = 5;

  while (depth < maxDepth) {
    try {
      const response = await axios.get(currentUrl, {
        maxRedirects: 0,
        headers: { 
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
        },
        validateStatus: (status) => status >= 200 && status < 400,
        timeout: 8000
      });

      if (response.status >= 300 && response.status < 400 && response.headers.location) {
        let nextUrl = response.headers.location;
        if (!nextUrl.startsWith('http')) {
          const urlObj = new URL(currentUrl);
          nextUrl = `${urlObj.protocol}//${urlObj.host}${nextUrl}`;
        }
        currentUrl = nextUrl;
        depth++;
        console.log(`[Scraper] Redirecting (${depth}): ${currentUrl}`);
      } else {
        break; 
      }
    } catch (error: any) {
      if (error.response && error.response.status >= 300 && error.response.status < 400 && error.response.headers.location) {
        let nextUrl = error.response.headers.location;
        if (!nextUrl.startsWith('http')) {
          const urlObj = new URL(currentUrl);
          nextUrl = `${urlObj.protocol}//${urlObj.host}${nextUrl}`;
        }
        currentUrl = nextUrl;
        depth++;
        console.log(`[Scraper] Redirecting (${depth}): ${currentUrl}`);
      } else {
        break;
      }
    }
  }
  return currentUrl;
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
  
  const ogTitle = getMeta('og:title') || "";
  let title = (ogTitle || $('title').text() || "").trim();
  const imageUrl = getMeta('og:image') || "";
  let description = getMeta('description') || "";
  let price = "";
  let originalPrice = "";
  let categoryName = "";
  let images: string[] = [];

  // Check if we hit a Login Wall
  const isLoginWall = title.toLowerCase().includes('login') && title.toLowerCase().includes('shopee');

  if (imageUrl && !isLoginWall) images.push(imageUrl);

  // Extract from LD+JSON (Deep Scan)
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const json = JSON.parse($(el).html() || "{}");
      
      // If Stage 1/2 hit Login Wall, title might be found in Breadcrumbs!
      if (json["@type"] === "BreadcrumbList") {
        const items = json.itemListElement;
        if (items && items.length > 0) {
          const lastItem = items[items.length - 1];
          const breadcrumbName = lastItem.name || (lastItem.item && lastItem.item.name) || "";
          
          if (isLoginWall && breadcrumbName) {
             title = breadcrumbName; // Use leaked breadcrumb as title
          }
          
          if (items.length > 1 && !categoryName) {
            const catItem = items[items.length - 2];
            categoryName = catItem.name || (catItem.item && catItem.item.name) || "";
          }
        }
      }

      if (json["@type"] === "Product") {
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
        // If product script is found, its name is the best title
        if (json.name) title = json.name;
      }
    } catch (e) {}
  });

  // Final Title Cleaning
  title = title.split(' | ')[0]
             .replace(/^jual\s+/i, '')
             .replace(/Login sekarang untuk mulai berbelanja!/i, '')
             .trim();

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
  console.log(`\n[Scraper v8 Serverless] 🚀 Target: ${url}`);
  
  let cleanUrl = url.split('?')[0];
  if (url.includes('shope.ee') || url.includes('s.shopee.co.id')) cleanUrl = url; 

  // Follow redirects recursive (Stage 0)
  const finalUrl = await resolveUrl(cleanUrl);
  console.log(`[Scraper] Resolved Final URL: ${finalUrl}`);
  
  // --- STAGE 1: AZURE/MOBILE AXIOS STEALTH ---
  console.log(`[Scraper] ⚡ Stage 1: Fast Axios dengan Mobile Identity...`);
  try {
    const randomUA = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
    
    // We use mobile/Android headers because Shopee's mobile web leaks more LD+JSON data even when showing Login
    const response = await axios.get(finalUrl, {
      headers: {
        'User-Agent': randomUA,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
        'Cache-Control': 'max-age=0',
        'Sec-Ch-Ua': '"Not A(Brand";v="99", "Google Chrome";v="121", "Chromium";v="121"',
        'Sec-Ch-Ua-Mobile': '?1',
        'Sec-Ch-Ua-Platform': '"Android"',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Upgrade-Insecure-Requests': '1',
        'Referer': 'https://www.google.com/'
      },
      timeout: 12000
    });

    const html = response.data;
    const $ = cheerio.load(html);
    const data = extractMetadata($);

    // Vercel Fallback Logic
    // Even if we hit the Login page, extractMetadata tries to parse BreadcrumbList
    // If the data has at least a title (from Breadcrumbs), we count it as a partial success!
    if (data.title && !data.title.toLowerCase().includes('login') && !data.title.toLowerCase().includes('shopee indonesia')) {
      console.log(`[Scraper] ✅ Stage 1 Berhasil menemukan data: ${data.title}`);
      
      // If price is missing but title exists, add a prompt
      if (!data.price) {
        console.log(`[Scraper] ⚠️ Harga tidak tersedia (Terhalang Login), namun Nama Produk selamat!`);
      }
      
      return { success: true, data };
    }

    console.log(`[Scraper] ❌ Stage 1 Gagal menarik data bermakna. Halaman mungkin kosong atau terblokir penuh.`);
    return {
      success: false,
      error: "Shopee mengunci halaman produk (Login Wall). Ekstraksi data otomatis gagal."
    };

  } catch (err: any) {
    console.error(`[Scraper] 💀 Error Stage 1:`, err.message);
    return {
       success: false,
       error: `Gagalan koneksi: ${err.response?.status || err.message}`
    };
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
