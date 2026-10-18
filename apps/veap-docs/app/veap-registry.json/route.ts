import registryData from "../../veap-registry.json";

export const dynamic = "force-static";

export function GET() {
  return new Response(JSON.stringify(registryData, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
