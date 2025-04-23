// This file is no longer needed as we're using file uploads instead of an API
// We'll keep it as a placeholder in case we need to add server functionality later
export async function GET() {
  return new Response(JSON.stringify({ message: "This endpoint is no longer used" }), {
    headers: { "Content-Type": "application/json" },
  })
}

export async function POST() {
  return new Response(JSON.stringify({ message: "This endpoint is no longer used" }), {
    headers: { "Content-Type": "application/json" },
  })
}
