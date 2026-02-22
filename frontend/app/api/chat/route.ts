export async function POST(req: Request) {
  try {
    const body = await req.json()

    // 🔍 Basic validation
    if (!body.session_id) {
      return new Response('Missing session_id', { status: 400 })
    }

    if (!body.messages || !Array.isArray(body.messages)) {
      return new Response('Invalid messages payload', { status: 400 })
    }

    const backendUrl =
      process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'

    const response = await fetch(`${backendUrl}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errorText = await response.text()
      return new Response(errorText || 'Backend error', {
        status: response.status,
      })
    }

    // 🔥 STREAM PASSTHROUGH
    return new Response(response.body, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      },
    })

  } catch (error) {
    console.error('Chat proxy error:', error)
    return new Response('Backend connection failed', { status: 500 })
  }
}