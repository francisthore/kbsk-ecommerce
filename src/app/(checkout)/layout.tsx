import CheckoutHeaderWrapper from "./CheckoutHeaderWrapper";

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <CheckoutHeaderWrapper />
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
