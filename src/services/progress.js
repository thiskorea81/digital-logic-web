// 문항별 풀이 기록(이 브라우저에만 저장, 서버 전송 없음). 정보ON처럼 문제를 골라 풀고
// 문항마다 O(마지막으로 맞힘)·X(마지막으로 틀림)·?(헷갈림 표시)를 남긴다. 오답노트·리포트도 여기서 만든다.
import { ref } from 'vue'
import { readKey, writeKey, recordAttempt } from './storage.js'
import { getReviewQuestions } from '../data'

// localStorage는 반응형이 아니라서, 쓸 때마다 올려 화면이 다시 읽게 한다
export const progressTick = ref(0)

function answers() {
  return readKey('answers', {})
}
function confusedMap() {
  return readKey('confused', {})
}

export function getAnswer(id) {
  void progressTick.value
  return answers()[id] ?? null
}

// 답을 내면 기록: 마지막으로 고른 답·맞힘 여부·푼 횟수·첫 시도 결과
export function recordAnswer(q, selected) {
  const all = answers()
  const ok = Number(selected) === q.정답
  const prev = all[q.id]
  all[q.id] = {
    sel: Number(selected),
    ok,
    at: new Date().toISOString(),
    tries: (prev?.tries ?? 0) + 1,
    firstOk: prev ? prev.firstOk : ok,
  }
  writeKey('answers', all)
  recordAttempt(q.standard_id, q.id, ok) // 성취기준별 진행도(처음 화면·학습 현황)도 함께
  progressTick.value++
  return all[q.id]
}

export function isConfused(id) {
  void progressTick.value
  return Boolean(confusedMap()[id])
}

export function setConfused(id, on) {
  const m = confusedMap()
  if (on) m[id] = new Date().toISOString()
  else delete m[id]
  writeKey('confused', m)
  progressTick.value++
}

// 표시: ?(헷갈림)가 먼저, 그다음 마지막 결과 O/X, 안 풀었으면 ''
export function markOf(id) {
  if (isConfused(id)) return '?'
  const a = getAnswer(id)
  return a ? (a.ok ? 'o' : 'x') : ''
}

function optionText(q, key) {
  return q.선택지?.[key] ?? String(key)
}

// 단원 요약(목록용)
export function unitSummary(unitNo) {
  void progressTick.value
  const qs = getReviewQuestions(unitNo)
  const s = { total: qs.length, solved: 0, o: 0, x: 0, q: 0, wrong: [], confused: [], lastAt: null, legacy: null }
  for (const q of qs) {
    const a = getAnswer(q.id)
    const m = markOf(q.id)
    if (a) {
      s.solved++
      if (!s.lastAt || a.at > s.lastAt) s.lastAt = a.at
    }
    if (m === 'o') s.o++
    else if (m === 'x') s.x++
    else if (m === '?') s.q++
    const item = {
      id: q.id,
      문제: q.문제,
      선택한답: a ? `${a.sel}번 ${optionText(q, a.sel)}` : '(아직 안 풂)',
      정답: `${q.정답}번 ${optionText(q, q.정답)}`,
      해설: q.해설,
    }
    if (m === 'x') s.wrong.push(item)
    if (m === '?') s.confused.push(item)
  }
  return s
}
