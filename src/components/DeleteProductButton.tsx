'use client';

import { Trash2 } from "lucide-react";
import { deleteProduct } from "@/app/actions";

interface DeleteProductButtonProps {
  productId: number;
}

export default function DeleteProductButton({ productId }: DeleteProductButtonProps) {
  const handleDelete = async () => {
    if (confirm('Yakin ingin menghapus produk ini?')) {
      const formData = new FormData();
      formData.append('id', productId.toString());
      await deleteProduct(productId); // directly calling the action
    }
  };

  return (
    <button 
      onClick={handleDelete}
      style={{ background: 'transparent', border: 'none', color: '#Ef4444', cursor: 'pointer' }}
    >
      <Trash2 size={18} />
    </button>
  );
}
