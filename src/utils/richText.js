// 자료 본문에 쓰이는 두 가지 표기를 실제 브라우저에서 안정적으로 렌더링하기 위한 유틸.
// 1) 보수(complement) 표기: 유니코드 결합 문자(U+0305, combining overline)를 글자 뒤에 붙이는
//    방식은 폰트/브라우저에 따라 위치가 어긋나거나 안 보이는 경우가 많아, 해당 글자를
//    <span class="bar">로 감싸 CSS text-decoration:overline을 입힌다.
// 2) 빈칸(cloze) 표기: 본문 안의 {{용어}}를 상황에 따라 색상 강조(웹페이지)나 빈칸(인쇄용)으로
//    바꿔 렌더링한다.
const OVERLINE_MARK = '̅'

function escapeHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function renderOverlineSegment(segment) {
  const chars = Array.from(segment)
  let html = ''
  for (let i = 0; i < chars.length; i++) {
    const c = chars[i]
    if (c === OVERLINE_MARK) continue
    if (chars[i + 1] === OVERLINE_MARK) {
      html += `<span class="bar">${escapeHtml(c)}</span>`
    } else {
      html += escapeHtml(c)
    }
  }
  return html
}

// 보수 표기만 처리(빈칸 마커가 없는 문제/선택지/해설 등에 사용).
export function renderOverlineHtml(text) {
  if (!text) return ''
  return renderOverlineSegment(String(text))
}

// mode: 'highlight' (웹페이지 - 빈칸 단어를 색으로 강조) | 'blank' (인쇄 - 빈칸으로 표시)
// | 'plain' (마커만 제거하고 평문으로)
export function renderRichText(text, mode = 'highlight') {
  if (!text) return ''
  const parts = String(text).split(/\{\{(.+?)\}\}/g)
  return parts
    .map((part, i) => {
      if (i % 2 === 0) return renderOverlineSegment(part)
      if (mode === 'plain') return renderOverlineSegment(part)
      if (mode === 'blank') {
        const width = Math.max(Array.from(part).length, 2)
        return `<span class="cloze-blank" style="min-width:${width}ch"></span>`
      }
      return `<mark class="cloze">${renderOverlineSegment(part)}</mark>`
    })
    .join('')
}

// content 안에서 {{용어}} 빈칸이 포함된 문장/줄만 뽑아 핵심정리용 목록을 만든다.
export function extractClozeSentences(content) {
  if (!content) return []
  const lines = content.split('\n')
  const sentences = []
  for (const line of lines) {
    const parts = line.split(/(?<=[.?!])\s+(?=\S)/)
    for (const part of parts) {
      const t = part.trim()
      if (t.includes('{{')) sentences.push(t)
    }
  }
  return sentences
}
