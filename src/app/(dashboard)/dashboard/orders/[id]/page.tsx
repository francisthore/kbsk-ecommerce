export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Order #{id}</h1>
      {/* Order details will be displayed here */}
    </div>
  );
}
