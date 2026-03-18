async function test() {
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': 'test',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: "claude-3-5-haiku-20241022",
        max_tokens: 1000,
        messages: [
          { role: 'user', content: 'hello' }
        ]
      })
    });
    console.log("STATUS:", response.status);
    const text = await response.text();
    console.log("BODY:", text);
  } catch(e) { console.error("ERR:", e); }
}
test();
