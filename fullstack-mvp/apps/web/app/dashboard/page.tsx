export default function Dashboard() {
  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <ul className="mt-4 list-disc pl-6">
        <li><a className="text-blue-600 underline" href="/dashboard/projects">Projects</a></li>
        <li><a className="text-blue-600 underline" href="/dashboard/deployments">Deployments</a></li>
        <li><a className="text-blue-600 underline" href="/dashboard/settings">Settings</a></li>
      </ul>
    </main>
  );
}
