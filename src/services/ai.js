// OpenAI / Gemini / Claude를 브라우저에서 직접 호출해 유사 문제를 생성한다(백엔드 없음).
// 주의: API 키가 브라우저 네트워크 요청에 그대로 실린다 — 신뢰할 수 있는 개인 기기에서만
// 사용할 것. 각 제공사가 브라우저(CORS) 직접 호출을 허용하는 방식에 맞춰 호출한다.

function buildPrompt(baseQuestion) {
  const opts = Object.entries(baseQuestion.선택지 ?? {})
    .map(([k, v]) => `${k}) ${v}`)
    .join('\n')
  return `당신은 고등학교 '디지털논리회로' 과목 문제 출제 전문가입니다.
아래 기존 문제와 같은 주제·비슷한 난이도의 새로운 5지선다형 문제를 하나 만들어 주세요.
완전히 같은 문제를 반복하지 말고, 숫자·조건·소재를 바꾸거나 같은 개념을 다른 각도에서 물어보세요.
정답은 선택지 중 명확히 하나여야 하고, 한국어로 작성하세요.

[기존 문제]
문제: ${baseQuestion.문제 ?? ''}
선택지:
${opts}
정답: ${baseQuestion.정답}번
해설: ${baseQuestion.해설 ?? ''}

다음 JSON 형식으로만 응답하세요. 다른 설명, 코드블록 표시 없이 JSON 객체 하나만 출력하세요.
{"문제": "...", "선택지": {"1": "...", "2": "...", "3": "...", "4": "...", "5": "..."}, "정답": 3, "해설": "..."}`
}

function extractJson(text) {
  const start = text.indexOf('{')
  const end = text.lastIndexOf('}')
  if (start === -1 || end === -1 || end < start) {
    throw new Error('AI 응답에서 JSON을 찾지 못했습니다: ' + text.slice(0, 200))
  }
  const parsed = JSON.parse(text.slice(start, end + 1))
  if (!parsed.문제 || !parsed.선택지 || !parsed.정답) {
    throw new Error('AI 응답 형식이 올바르지 않습니다(문제/선택지/정답 누락).')
  }
  return parsed
}

async function callOpenAI({ apiKey, model, prompt }) {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.8,
    }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data?.error?.message ?? `OpenAI 요청 실패 (${res.status})`)
  return extractJson(data.choices?.[0]?.message?.content ?? '')
}

async function callGemini({ apiKey, model, prompt }) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.8 },
    }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data?.error?.message ?? `Gemini 요청 실패 (${res.status})`)
  const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text).join('') ?? ''
  return extractJson(text)
}

async function callClaude({ apiKey, model, prompt }) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model,
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data?.error?.message ?? `Claude 요청 실패 (${res.status})`)
  const text = data.content?.map((c) => c.text ?? '').join('') ?? ''
  return extractJson(text)
}

const CALLERS = { openai: callOpenAI, gemini: callGemini, claude: callClaude }

export async function generateSimilarQuestion({ provider, apiKey, model, baseQuestion }) {
  if (!apiKey) throw new Error('설정에서 API 키를 먼저 입력해 주세요.')
  const caller = CALLERS[provider]
  if (!caller) throw new Error('지원하지 않는 AI 제공사입니다: ' + provider)
  const prompt = buildPrompt(baseQuestion)
  try {
    const result = await caller({ apiKey, model, prompt })
    return {
      id: `ai_${provider}_${Date.now()}`,
      문제: result.문제,
      선택지: result.선택지,
      정답: Number(result.정답),
      해설: result.해설 ?? '',
      generatedBy: provider,
      generatedAt: new Date().toISOString(),
    }
  } catch (e) {
    if (e instanceof TypeError) {
      throw new Error(
        '요청이 브라우저에서 차단되었습니다(네트워크 또는 CORS 문제일 수 있어요). API 키와 네트워크 연결을 확인해 주세요.'
      )
    }
    throw e
  }
}

export const PROVIDER_LABELS = {
  openai: 'OpenAI (GPT)',
  gemini: 'Google Gemini',
  claude: 'Anthropic Claude',
}

export const DEFAULT_MODELS = {
  openai: 'gpt-4o-mini',
  gemini: 'gemini-2.5-flash',
  claude: 'claude-haiku-4-5-20251001',
}
