<script setup>
// 문제 하나 풀기(정보ON 방식): 답을 고르고 '제출' → 정답·해설. 이미 푼 문제는 지난번 결과부터 보여 주고 '다시 풀기'로 새로.
// '헷갈려요 ?'를 누르면 ? 표시(오답노트에 모임). 이전/다음은 목록에서 고른 소단원 범위 안에서.
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getQuestion, getUnit, subunitOf } from '../data'
import { getAnswer, isConfused, markOf, recordAnswer, setConfused } from '../services/progress.js'
import { filteredQuestions } from '../services/subunitFilter.js'
import QuestionBody from '../components/QuestionBody.vue'
import AiSimilarQuestion from '../components/AiSimilarQuestion.vue'
import { renderOverlineHtml } from '../utils/richText'
import SolveMark from '../components/SolveMark.vue'

const props = defineProps({
  unitNo: { type: String, required: true },
  qid: { type: String, required: true },
})
const route = useRoute()
const router = useRouter()

const entry = computed(() => getQuestion(props.qid))
const q = computed(() => entry.value?.q ?? null)
const unit = computed(() => getUnit(props.unitNo))
const scope = computed(() => {
  const list = filteredQuestions(props.unitNo)
  return list.some((x) => x.id === props.qid) ? list : filteredQuestions(props.unitNo, [])
})
const pos = computed(() => scope.value.findIndex((x) => x.id === props.qid))
const prevId = computed(() => (pos.value > 0 ? scope.value[pos.value - 1].id : null))
const nextId = computed(() => (pos.value >= 0 && pos.value < scope.value.length - 1 ? scope.value[pos.value + 1].id : null))

const selected = ref(null)
const result = ref(null) // { sel, ok, at, tries, firstOk }
const restored = ref(false)

function load() {
  selected.value = null
  result.value = null
  restored.value = false
  const a = getAnswer(props.qid)
  if (a && !route.query.fresh) {
    result.value = a
    selected.value = a.sel
    restored.value = true
  }
}
watch(() => props.qid, load, { immediate: true })

function submit() {
  if (selected.value === null || !q.value) return
  result.value = recordAnswer(q.value, selected.value)
  restored.value = false
}
function retry() {
  result.value = null
  selected.value = null
  restored.value = false
}
function go(id) {
  if (id) router.push({ name: 'question', params: { unitNo: props.unitNo, qid: id } })
}
const confused = computed(() => isConfused(props.qid))
function when(iso) {
  const d = new Date(iso)
  return d.toLocaleString('ko-KR', { month: 'numeric', day: 'numeric', hour: 'numeric', minute: '2-digit' })
}
</script>

<template>
  <RouterLink :to="{ name: 'quiz', params: { unitNo } }" class="back">← {{ unit?.단원 }} 문제 목록</RouterLink>
  <template v-if="q">
    <p class="meta">
      <span>{{ subunitOf(q) }}</span>
      <span v-if="q.세부내용" class="dim">· {{ q.세부내용 }}</span>
      <span v-if="q.난이도" class="level" :class="`lv-${q.난이도}`">{{ q.난이도 }}</span>
      <SolveMark :mark="markOf(q.id)" />
    </p>

    <QuestionBody :question="q" />

    <ul class="options">
      <li v-for="(text, key) in q.선택지" :key="key">
        <button
          class="option"
          :class="{
            picked: !result && Number(selected) === Number(key),
            correct: result && Number(key) === q.정답,
            wrong: result && Number(key) === result.sel && !result.ok,
          }"
          :disabled="!!result"
          @click="selected = Number(key)"
        >
          <span class="option-key">{{ key }}</span>
          <span v-html="renderOverlineHtml(text)"></span>
        </button>
      </li>
    </ul>

    <div class="actions">
      <button v-if="!result" class="primary-btn" :disabled="selected === null" @click="submit">제출</button>
      <button v-else class="primary-btn" @click="retry">다시 풀기</button>
      <button class="confuse-btn" :class="{ on: confused }" @click="setConfused(q.id, !confused)">
        {{ confused ? '? 표시 해제' : '헷갈려요 ? 표시' }}
      </button>
    </div>

    <div v-if="result" class="explanation" :class="result.ok ? 'ok' : 'bad'">
      <p v-if="restored" class="prev">
        지난번 결과 · {{ when(result.at) }}<template v-if="result.tries > 1"> · {{ result.tries }}번 풂</template>
      </p>
      <p class="verdict">{{ result.ok ? '정답입니다!' : '오답입니다.' }} <span v-if="!result.ok">(정답: {{ q.정답 }}번)</span></p>
      <p class="text" v-html="renderOverlineHtml(q.해설)"></p>
    </div>
    <AiSimilarQuestion v-if="result" :key="q.id" :standard-id="q.standard_id" :base-question="q" />

    <nav class="pager">
      <button :disabled="!prevId" @click="go(prevId)">← 이전 문제</button>
      <span>{{ pos + 1 }} / {{ scope.length }}</span>
      <button :disabled="!nextId" @click="go(nextId)">다음 문제 →</button>
    </nav>
  </template>
  <p v-else>문제를 찾을 수 없습니다.</p>
</template>

<style scoped>
.back {
  display: inline-block;
  color: var(--text-dim);
  text-decoration: none;
  font-size: 14px;
  margin-bottom: 14px;
}
.meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--accent);
  font-weight: 600;
  margin: 0 0 10px;
}
.dim {
  color: var(--text-dim);
  font-weight: 400;
}
.level {
  font-size: 11px;
  font-weight: 700;
  border-radius: 999px;
  padding: 2px 8px;
  border: 1px solid;
}
.lv-쉬움 {
  color: #15803d;
  border-color: #86efac;
}
.lv-보통 {
  color: #b45309;
  border-color: #fcd34d;
}
.lv-어려움 {
  color: #be123c;
  border-color: #fda4af;
}
.options {
  list-style: none;
  margin: 0 0 16px;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.option {
  display: flex;
  gap: 10px;
  width: 100%;
  text-align: left;
  padding: 12px 14px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--bg);
  color: var(--text);
  font-size: 15px;
  line-height: 1.5;
  cursor: pointer;
}
.option:disabled {
  cursor: default;
}
.option:not(:disabled):hover {
  border-color: var(--accent-border);
}
.option.picked {
  border-color: var(--accent);
  background: var(--accent-bg);
}
.option.correct {
  border-color: var(--ok);
  background: color-mix(in srgb, var(--ok) 12%, transparent);
}
.option.wrong {
  border-color: var(--bad);
  background: color-mix(in srgb, var(--bad) 12%, transparent);
}
.option-key {
  font-weight: 700;
  color: var(--text-dim);
}
.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 14px;
}
.primary-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  background: var(--accent);
  color: #fff;
  font-weight: 700;
  font-size: 15px;
  cursor: pointer;
}
.primary-btn:disabled {
  opacity: 0.45;
  cursor: default;
}
.confuse-btn {
  padding: 10px 16px;
  border: 1px solid #f59e0b;
  border-radius: 8px;
  background: transparent;
  color: #b45309;
  font-size: 14px;
  cursor: pointer;
}
.confuse-btn.on {
  background: rgba(245, 158, 11, 0.14);
  font-weight: 700;
}
@media (prefers-color-scheme: dark) {
  .confuse-btn {
    color: #fcd34d;
  }
}
.explanation {
  border-radius: 10px;
  padding: 14px 16px;
  margin-bottom: 18px;
  border: 1px solid;
}
.explanation.ok {
  border-color: var(--ok);
  background: color-mix(in srgb, var(--ok) 8%, transparent);
}
.explanation.bad {
  border-color: var(--bad);
  background: color-mix(in srgb, var(--bad) 8%, transparent);
}
.prev {
  font-size: 12px;
  color: var(--text-dim);
  margin: 0 0 4px;
}
.verdict {
  font-weight: 800;
  margin: 0 0 6px;
}
.text {
  margin: 0;
  line-height: 1.7;
  white-space: pre-line;
}
.pager {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding-top: 14px;
  border-top: 1px solid var(--border);
}
.pager button {
  padding: 9px 14px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--bg);
  color: var(--text);
  cursor: pointer;
}
.pager button:disabled {
  opacity: 0.4;
  cursor: default;
}
.pager span {
  color: var(--text-dim);
  font-size: 13px;
}
</style>
