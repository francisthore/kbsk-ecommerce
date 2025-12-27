export default async function CollectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return (
    <div className="mx-auto w-[90%] py-8">
      <h1 className="text-3xl font-bold mb-6">Collection: {slug}</h1>
      {/* Collection products will be displayed here */}
    </div>
  );
}
