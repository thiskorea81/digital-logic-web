<script setup>
// 오답노트: 마지막으로 틀린 문제(X)와 헷갈린다고 표시한 문제(?)를 단원별로 모아 다시 본다.
// 정답·해설은 눌러서 펼치고, '다시 풀기'로 그 문제를 새로 푼다. 맞히면 X에서 빠진다(?는 직접 해제).
import { computed, ref } from 'vue'
import { renderOverlineHtml } from '../utils/richText'
import { getWrongNotes, removeWrongNote } from '../services/storage'
import { units, getReviewQuestions, subunitOf } from '../data'
import { getAnswer, markOf, progressTick, setConfused } from '../services/progress.js'
import SolveMark from '../components/SolveMark.vue'

const unitFilter = ref('') // '' = 전체
const kind = ref('all') // all | x | q

const items = computed(() => {
  void progressTick.value
  const out = []
  for (const u of units) {
    if (unitFilter.value && u.no !== unitFilter.value) continue
    for (const q of getReviewQuestions(u.no)) {
      const m = markOf(q.id)
      if (m !== 'x' && m !== '?') continue
      if (kind.value === 'x' && m !== 'x') continue
      if (kind.value === 'q' && m !== '?') continue
      out.push({ q, unit: u, mark: m, answer: getAnswer(q.id) })
    }
  }
  return out
})
const counts = computed(() => {
  void progressTick.value
  let x = 0
  let qn = 0
  for (const u of units) for (const q of getReviewQuestions(u.no)) {
    const m = markOf(q.id)
    if (m === 'x') x++
    if (m === '?') qn++
  }
  return { x, q: qn }
})
const opt = (q, k) => q.선택지?.[k] ?? k
// AI 유사 문제에서 틀린 기록(문항 id가 없어 O/X로 못 묶음)은 따로 보여 준다
const aiNotes = ref(getWrongNotes().map((n, i) => ({ ...n, i })).filter((n) => n.source === 'ai'))
function removeAi(i) {
  removeWrongNote(i)
  aiNotes.value = getWrongNotes().map((n, j) => ({ ...n, i: j })).filter((n) => n.source === 'ai')
}
</script>

<template>
  <h1 class="page-title">오답노트</h1>
  <p class="hint">틀린 문제(X)와 헷갈린다고 표시한 문제(?)가 모여요. 다시 풀어 맞히면 X에서 빠지고, ?는 직접 해제해요.</p>

  <div class="filters">
    <button :class="{ on: kind === 'all' }" @click="kind = 'all'">모두 {{ counts.x + counts.q }}</button>
    <button :class="{ on: kind === 'x' }" @click="kind = 'x'">X 틀림 {{ counts.x }}</button>
    <button :class="{ on: kind === 'q' }" @click="kind = 'q'">? 헷갈림 {{ counts.q }}</button>
    <select v-model="unitFilter">
      <option value="">전체 단원</option>
      <option v-for="u in units" :key="u.no" :value="u.no">{{ u.단원 }}</option>
    </select>
  </div>

  <p v-if="!items.length" class="empty">여기에 모인 문제가 없어요. 👍</p>
  <article v-for="it in items" :key="it.q.id" class="note">
    <header>
      <SolveMark :mark="it.mark" />
      <span class="where">{{ it.unit.단원 }} · {{ subunitOf(it.q) }}</span>
    </header>
    <p class="stem" v-html="renderOverlineHtml(it.q.문제)"></p>
    <p v-if="it.answer" class="mine">내가 고른 답: {{ it.answer.sel }}번 <span v-html="renderOverlineHtml(String(opt(it.q, it.answer.sel)))"></span></p>
    <details>
      <summary>정답·해설 보기</summary>
      <p class="ans">정답: {{ it.q.정답 }}번 <span v-html="renderOverlineHtml(String(opt(it.q, it.q.정답)))"></span></p>
      <p class="exp" v-html="renderOverlineHtml(it.q.해설)"></p>
    </details>
    <footer>
      <RouterLink :to="{ name: 'question', params: { unitNo: it.unit.no, qid: it.q.id }, query: { fresh: 1 } }" class="retry">
        다시 풀기 →
      </RouterLink>
      <button v-if="it.mark === '?'" class="unmark" @click="setConfused(it.q.id, false)">? 해제</button>
    </footer>
  </article>

  <template v-if="aiNotes.length && kind !== 'q'">
    <h2 class="sub-title">AI 유사 문제에서 틀린 문제</h2>
    <article v-for="n in aiNotes" :key="n.i" class="note">
      <p class="stem" v-html="renderOverlineHtml(n.문제)"></p>
      <p class="mine">내가 고른 답: <span v-html="renderOverlineHtml(String(n.선택한답))"></span></p>
      <details>
        <summary>정답·해설 보기</summary>
        <p class="ans">정답: <span v-html="renderOverlineHtml(String(n.정답))"></span></p>
        <p class="exp" v-html="renderOverlineHtml(n.해설 || '')"></p>
      </details>
      <footer><button class="unmark" @click="removeAi(n.i)">지우기</button></footer>
    </article>
  </template>
</template>

<style scoped>
.sub-title {
  font-size: 16px;
  margin: 24px 0 10px;
}
.page-title {
  font-size: 24px;
  margin: 0 0 8px;
}
.hint {
  color: var(--text-dim);
  font-size: 14px;
  line-height: 1.6;
  margin: 0 0 16px;
}
.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 16px;
}
.filters button,
.filters select {
  border: 1px solid var(--border);
  background: var(--bg);
  color: var(--text-dim);
  border-radius: 999px;
  padding: 6px 12px;
  font-size: 13px;
  cursor: pointer;
}
.filters button.on {
  color: var(--accent);
  border-color: var(--accent-border);
  background: var(--accent-bg);
  font-weight: 600;
}
.empty {
  color: var(--text-dim);
}
.note {
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 14px 16px;
  margin-bottom: 12px;
}
.note header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}
.where {
  font-size: 12px;
  color: var(--text-dim);
}
.stem {
  margin: 0 0 8px;
  line-height: 1.6;
  white-space: pre-line;
}
.mine {
  font-size: 14px;
  color: var(--bad);
  margin: 0 0 8px;
}
details {
  font-size: 14px;
  margin-bottom: 8px;
}
summary {
  cursor: pointer;
  color: var(--accent);
}
.ans {
  color: var(--ok);
  font-weight: 600;
  margin: 8px 0 4px;
}
.exp {
  margin: 0;
  line-height: 1.7;
  white-space: pre-line;
}
.note footer {
  display: flex;
  gap: 10px;
  align-items: center;
}
.retry {
  color: var(--accent);
  font-weight: 600;
  text-decoration: none;
  font-size: 14px;
}
.unmark {
  border: none;
  background: none;
  color: var(--text-dim);
  font-size: 13px;
  cursor: pointer;
}
</style>
