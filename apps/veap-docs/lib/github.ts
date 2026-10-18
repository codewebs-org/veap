import { REGISTRY_REPO } from "@/lib/plugins";

export async function fetchStarCount() {
  try {
    const res = await fetch(`https://api.github.com/repos/${REGISTRY_REPO}`, {
      next: { revalidate: 3600 },
    });
    const data = await res.json();
    return (data.stargazers_count as number) ?? null;
  } catch {
    return null;
  }
}
