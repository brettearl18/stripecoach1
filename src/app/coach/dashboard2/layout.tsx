'use client';

export default function Dashboard2Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#141517]">
      {children}
    </div>
  );
} 