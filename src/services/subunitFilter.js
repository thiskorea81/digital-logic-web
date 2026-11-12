// 단원별로 고른 소단원(빈 배열 = 전체)을 기억한다. 문제 목록과 풀이 화면의 이전/다음이 같은 범위를 쓴다.
import { readKey, writeKey } from './storage.js'
import { getReviewQuestions, subunitOf } from '../data'

export function loadSubs(unitNo) {
  return readKey('subunits', {})[unitNo] ?? []
}

export function saveSubs(unitNo, subs) {
  const all = readKey('subunits', {})
  all[unitNo] = subs
  writeKey('subunits', all)
}

export function filteredQuestions(unitNo, subs = loadSubs(unitNo)) {
  const qs = getReviewQuestions(unitNo)
  return subs.length ? qs.filter((q) => subs.includes(subunitOf(q))) : qs
}
