export async function POST(req: Request) {
  try {
    const formData = await req.formData()

    const file = formData.get('file')

    // 🔍 Validate file presence
    if (!file) {
      return new Response('No file uploaded', { status: 400 })
    }

    const backendUrl =
      process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'

    const response = await fetch(`${backendUrl}/process`, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const errorText = await response.text()
      return new Response(errorText || 'Backend processing error', {
        status: response.status,
      })
    }

    const data = await response.json()

    // Ensure required fields exist
    if (!data.session_id || !data.extracted_text) {
      return new Response('Invalid backend response', { status: 500 })
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    })

  } catch (error) {
    console.error('Process proxy error:', error)
    return new Response('Processing failed', { status: 500 })
  }
}