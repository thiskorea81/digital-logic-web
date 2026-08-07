// 원문 데이터의 보수(complement) 표기는 유니코드 결합 문자(U+0305, combining overline)를
// 글자 뒤에 붙이는 방식(예: "A" + ̅ -> "A̅")을 쓰는데, 이 결합 문자는 폰트/브라우저에
// 따라 위치가 어긋나거나 아예 렌더링되지 않는 경우가 많다. SVG 다이어그램에서는 이미
// text-decoration:overline을 tspan에 직접 입히는 방식으로 이 문제를 피해 가고 있으므로,
// 일반 텍스트(문단/표/문제)에서도 같은 원리로 해당 글자를 <span class="bar">로 감싸
// CSS overline을 입혀서 렌더링한다.
const OVERLINE_MARK = '̅'

function escapeHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

export function renderOverlineHtml(text) {
  if (!text) return ''
  const chars = Array.from(String(text))
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
