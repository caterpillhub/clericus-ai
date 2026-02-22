export async function POST(req: Request) {
  try {
    const { messages } = await req.json()

    if (!messages || messages.length === 0) {
      return new Response('No messages provided', { status: 400 })
    }

    const lastMessage = messages[messages.length - 1]
    const userInput = (lastMessage?.content || '').toLowerCase()

    // Mock responses database
    const mockResponses: { [key: string]: string } = {
      'help': 'I\'m FormAssist, your AI form helper! I can assist you with:\n\n• Filling out complex forms\n• Understanding form fields and requirements\n• Providing examples and suggestions\n• Organizing information for form submission\n• Validating your form data\n\nJust let me know what form you need help with, and I\'ll guide you through it step by step.',
      'form': 'Great! I\'d be happy to help you with your form. Could you provide more details about:\n\n1. What type of form is it? (Job application, visa form, survey, loan application, etc.)\n2. Which specific fields are giving you trouble?\n3. What information do you need to fill in?\n\nOnce you give me these details, I can provide specific guidance and examples.',
      'file': 'I see you\'ve uploaded a file! In this demo version, I acknowledge the upload. You can:\n\n• Describe what\'s in the file\n• Ask me questions about specific form fields\n• Request help understanding requirements\n• Share the text content for analysis\n\nPlease share the key details from your form, and I\'ll provide expert assistance!',
      'photo': 'You\'ve shared a photo! I can help you work with what\'s shown. Please describe:\n\n• What form or document is displayed?\n• What specific help do you need?\n• Are there particular fields that are confusing?\n• Do you need help filling in similar information?\n\nI\'ll provide detailed, practical guidance based on your description.',
      'default': 'That\'s a great question! I can help you with:\n\n• Explaining form requirements and field types\n• Suggesting appropriate answers for common fields\n• Providing real-world examples\n• Organizing your information for submission\n• Validating your answers\n\nWhat specific form field or requirement would you like help with?'
    }

    // Find matching response based on keywords
    let response = mockResponses.default
    for (const [key, value] of Object.entries(mockResponses)) {
      if (key !== 'default' && userInput.includes(key)) {
        response = value
        break
      }
    }

    // Stream the response with realistic delays
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      start(controller) {
        let index = 0
        const interval = setInterval(() => {
          if (index < response.length) {
            controller.enqueue(encoder.encode(response[index]))
            index++
          } else {
            clearInterval(interval)
            controller.close()
          }
        }, 10) // Simulate character-by-character streaming
      }
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      }
    })
  } catch (error) {
    console.error('Chat API error:', error)
    return new Response('Failed to process chat message', { status: 500 })
  }
}
