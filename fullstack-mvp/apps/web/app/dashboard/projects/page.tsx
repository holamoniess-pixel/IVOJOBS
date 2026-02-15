"use client";
import { useEffect, useState } from "react";

export default function Projects() {
  const [name, setName] = useState("");
  const [userId, setUserId] = useState("");
  const [deployments, setDeployments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  async function load() {
    const res = await fetch("/api/deployments");
    const data = await res.json();
    setDeployments(data);
  }

  useEffect(() => {
    load();
  }, []);

  async function createProject() {
    if (!name || !userId) return;
    setLoading(true);
    await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, userId })
    });
    setName("");
    setUserId("");
    await load();
    setLoading(false);
  }

  return (
    <main className="p-6 max-w-2xl">
      <h1 className="text-2xl font-semibold">Projects</h1>
      <div className="mt-4 space-y-2">
        <input className="border p-2 w-full" placeholder="Project name" value={name} onChange={(e) => setName(e.target.value)} />
        <input className="border p-2 w-full" placeholder="User ID" value={userId} onChange={(e) => setUserId(e.target.value)} />
        <button onClick={createProject} disabled={loading} className="px-4 py-2 bg-black text-white rounded">{loading ? "Creating..." : "Create Project"}</button>
      </div>
      <h2 className="text-xl font-semibold mt-8">Recent Deployments</h2>
      <ul className="mt-3 space-y-2">
        {deployments.map((d) => (
          <li key={d.id} className="border p-3 rounded flex justify-between items-center">
            <div>
              <div className="font-mono text-sm">{d.id}</div>
              <div className="text-gray-600">{d.status}</div>
            </div>
            {d.url ? <a className="text-blue-600 underline" href={d.url} target="_blank" rel="noreferrer">Open</a> : null}
          </li>
        ))}
      </ul>
    </main>
  );
}
