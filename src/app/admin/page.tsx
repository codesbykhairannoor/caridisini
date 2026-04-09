import prisma from "@/lib/prisma";
import AdminDashboard from "@/components/AdminDashboard";

export const revalidate = 0;

export default async function AdminPage() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: 'desc' },
    include: { category: true }
  });

  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' }
  });

  return <AdminDashboard products={products} categories={categories} />;
}
