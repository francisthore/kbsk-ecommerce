export default function OrderDetailPage({ params }: { params: { id: string } }) {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Order #{params.id}</h1>
      {/* Order details will be displayed here */}
    </div>
  );
}
