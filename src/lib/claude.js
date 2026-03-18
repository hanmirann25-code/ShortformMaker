export async function generateScript({ jobType, tip, tone, duration }) {
  const API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY;
  if (!API_KEY) {
    throw new Error('API 키가 설정되지 않았습니다.');
  }

  const systemPrompt = `당신은 한국의 직장인 부업 유튜버를 위한 쇼츠 대본 전문가입니다.
주어진 부업 정보와 팁을 바탕으로 유튜브 쇼츠/릴스에 최적화된 대본을 작성합니다.
반드시 아래 JSON 형식으로만 응답하세요. 다른 텍스트는 절대 포함하지 마세요.

대본 작성 규칙:
- hook: 첫 3초 안에 시청자를 멈추게 하는 강렬한 한 문장
- body: 실제로 말하는 전체 대본을 빠짐없이 작성. 문장을 나열하지 말고 실제 말하듯이 자연스럽게 이어지도록 작성. 핵심 팁을 구체적인 수치, 경험담, 예시와 함께 상세하게 설명. 짧게 자르지 말고 영상 길이에 맞게 충분히 길게 작성.
- closing: 좋아요/구독을 자연스럽게 유도하는 마무리 멘트`;

  const durationGuide = {
    '30초': '약 75~90단어, 4~5문장',
    '60초': '약 150~180단어, 8~10문장',
    '90초': '약 220~270단어, 12~15문장',
  };
  const bodyGuide = durationGuide[duration] || '약 150~180단어, 8~10문장';

  const userMessage = `부업 종류: ${jobType}
공유할 팁: ${tip}
말투: ${tone}
영상 길이: ${duration}

body는 ${bodyGuide} 분량으로 실제 말하는 대본 전체를 작성해줘. 구체적인 수치와 예시를 포함해서 시청자가 바로 따라할 수 있을 만큼 상세하게 써줘.

아래 JSON 형식으로 대본을 작성해줘:
{
  "hook": "훅 문장 (첫 3초, 시선을 끄는 강렬한 한 문장)",
  "body": "본문 전체 대본 (${bodyGuide} 분량, 구체적이고 상세하게)",
  "closing": "마무리 멘트 (구독/좋아요 유도 포함, 2~3문장)",
  "thumbnails": ["썸네일 문구1", "썸네일 문구2", "썸네일 문구3"],
  "hashtags": ["해시태그1", "해시태그2", "해시태그3", "해시태그4", "해시태그5", "해시태그6", "해시태그7", "해시태그8", "해시태그9", "해시태그10"]
}`;

  const response = await fetch('/api/anthropic/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true'
    },
    body: JSON.stringify({
      model: "claude-3-haiku-20240307",
      max_tokens: 4096,
      system: systemPrompt,
      messages: [
        { role: 'user', content: userMessage }
      ]
    })
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    console.error('API 오류 상태:', response.status, response.statusText);
    console.error('API 오류 내용:', JSON.stringify(errorBody, null, 2));
    throw new Error(`API 호출 실패 (${response.status}): ${errorBody?.error?.message || errorBody?.error?.type || response.statusText}`);
  }

  const data = await response.json();
  const content = data.content[0].text;

  // JSON 블록만 추출 (Claude가 앞뒤에 텍스트를 붙이는 경우 대비)
  const jsonMatch = content.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    console.error('Claude 응답 원문:', content)
    throw new Error('대본 생성에 실패했습니다. 다시 시도해주세요.')
  }

  try {
    // JSON 문자열 값 안의 줄바꿈 문자를 \n으로 이스케이프 처리
    const cleaned = jsonMatch[0].replace(/("(?:[^"\\]|\\.)*")/gs, (match) =>
      match.replace(/\n/g, '\\n').replace(/\r/g, '\\r')
    )
    return JSON.parse(cleaned)
  } catch (error) {
    console.error('JSON 파싱 실패, 원문:', jsonMatch[0])
    throw new Error('대본 생성에 실패했습니다. 다시 시도해주세요.')
  }
}
