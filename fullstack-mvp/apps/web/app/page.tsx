export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="max-w-xl mx-auto p-6">
        <h1 className="text-3xl font-semibold">Fullstack MVP</h1>
        <p className="mt-2 text-gray-600">Next.js + Prisma + Redis + MCP Connector</p>
        <div className="mt-6 flex gap-3">
          <a className="px-4 py-2 bg-black text-white rounded" href="/dashboard">Open Dashboard</a>
          <a className="px-4 py-2 border rounded" href="/api/health">API Health</a>
        </div>
      </div>
    </main>
  );
}
