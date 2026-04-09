import { MetadataRoute } from 'next';
import prisma from '@/lib/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await prisma.product.findMany({
    select: { id: true, updatedAt: true }
  });

  const productUrls = products.map((product) => ({
    url: `https://caridisni.com/product/${product.id}`,
    lastModified: product.updatedAt,
  }));

  return [
    {
      url: 'https://caridisni.com',
      lastModified: new Date(),
    },
    ...productUrls,
  ];
}
