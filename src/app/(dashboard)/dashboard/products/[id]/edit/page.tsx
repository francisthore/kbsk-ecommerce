export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Edit Product #{id}</h1>
      {/* Product edit form will be displayed here */}
    </div>
  );
}
