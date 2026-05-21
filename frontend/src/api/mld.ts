import type { McdModel, MldModel } from "@mcd-to-mld/shared";

export async function generateMld(mcd: McdModel): Promise<MldModel> {
  const res = await fetch("http://localhost:4000/api/mld/generate", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(mcd)
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.error ?? `HTTP ${res.status}`);
  }
  return res.json();
}