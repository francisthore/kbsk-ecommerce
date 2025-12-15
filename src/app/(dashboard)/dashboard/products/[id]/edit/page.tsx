export default function EditProductPage({ params }: { params: { id: string } }) {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Edit Product #{params.id}</h1>
      {/* Product edit form will be displayed here */}
    </div>
  );
}
