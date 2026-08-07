<script setup>
import { computed, ref } from 'vue'
import { getMaterial, getQuestions } from '../data'
import { parsePipeTable } from '../utils/markdownTable'

const props = defineProps({
  standardId: { type: String, required: true },
})

const material = computed(() => getMaterial(props.standardId))
const questions = computed(() => getQuestions(props.standardId))

const index = ref(0)
const selected = ref(null)
const revealed = ref(false)
const correctCount = ref(0)
const finished = ref(false)

const current = computed(() => questions.value[index.value])
const currentTable = computed(() => (current.value ? parsePipeTable(current.value.표) : null))

function choose(optionKey) {
  if (revealed.value) return
  selected.value = optionKey
  revealed.value = true
  if (Number(optionKey) === current.value.정답) correctCount.value += 1
}

function next() {
  if (index.value < questions.value.length - 1) {
    index.value += 1
    selected.value = null
    revealed.value = false
  } else {
    finished.value = true
  }
}

function restart() {
  index.value = 0
  selected.value = null
  revealed.value = false
  correctCount.value = 0
  finished.value = false
}
</script>

<template>
  <RouterLink
    v-if="material"
    :to="{ name: 'material', params: { standardId: standardId } }"
    class="back"
  >
    ← {{ material.title }}
  </RouterLink>
  <RouterLink v-else to="/" class="back">← 전체 단원 목록</RouterLink>

  <template v-if="questions.length === 0">
    <p>이 성취기준에는 아직 문제가 없습니다.</p>
  </template>

  <template v-else-if="finished">
    <h1>결과</h1>
    <p class="score">{{ questions.length }}문항 중 {{ correctCount }}문항 정답</p>
    <button class="primary-btn" @click="restart">다시 풀기</button>
  </template>

  <template v-else-if="current">
    <p class="progress">{{ index + 1 }} / {{ questions.length }}</p>
    <h1 class="question">{{ current.문제 }}</h1>

    <table v-if="currentTable" class="q-table">
      <thead>
        <tr>
          <th v-for="(h, hi) in currentTable.headers" :key="hi">{{ h }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, ri) in currentTable.rows" :key="ri">
          <td v-for="(cell, ci) in row" :key="ci">{{ cell }}</td>
        </tr>
      </tbody>
    </table>
    <div v-if="current.이미지" class="q-diagram" v-html="current.이미지"></div>
    <pre v-if="current.코드" class="q-code"><code>{{ current.코드 }}</code></pre>

    <ul class="options">
      <li v-for="(text, key) in current.선택지" :key="key">
        <button
          class="option"
          :class="{
            selected: revealed && String(selected) === String(key),
            correct: revealed && Number(key) === current.정답,
            wrong: revealed && String(selected) === String(key) && Number(key) !== current.정답,
          }"
          :disabled="revealed"
          @click="choose(key)"
        >
          <span class="option-key">{{ key }}</span>
          <span>{{ text }}</span>
        </button>
      </li>
    </ul>

    <div v-if="revealed" class="explanation">
      <p class="verdict" :class="{ ok: Number(selected) === current.정답 }">
        {{ Number(selected) === current.정답 ? '정답입니다' : '오답입니다' }}
        (정답: {{ current.정답 }}번)
      </p>
      <p>{{ current.해설 }}</p>
      <button class="primary-btn" @click="next">
        {{ index < questions.length - 1 ? '다음 문제' : '결과 보기' }}
      </button>
    </div>
  </template>
</template>

<style scoped>
.back {
  display: inline-block;
  color: var(--text-dim);
  text-decoration: none;
  font-size: 14px;
  margin-bottom: 16px;
}

.progress {
  color: var(--text-dim);
  font-size: 13px;
  margin-bottom: 8px;
}

.question {
  font-size: 18px;
  line-height: 1.5;
  margin-bottom: 16px;
}

.q-table {
  border-collapse: collapse;
  width: 100%;
  margin-bottom: 16px;
  font-size: 14px;
  display: block;
  overflow-x: auto;
}

.q-table th,
.q-table td {
  border: 1px solid var(--border);
  padding: 8px 10px;
  text-align: center;
}

.q-table th {
  background: var(--bg-soft);
}

.q-diagram {
  margin: 12px 0;
  overflow-x: auto;
}

.q-diagram :deep(svg) {
  display: block;
  max-width: 100%;
  height: auto;
}

.q-code {
  background: var(--code-bg);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 12px;
  overflow-x: auto;
  font-size: 13px;
  margin-bottom: 16px;
}

.options {
  list-style: none;
  margin: 0 0 20px;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.option {
  width: 100%;
  display: flex;
  align-items: baseline;
  gap: 10px;
  padding: 12px 14px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--bg);
  color: var(--text);
  text-align: left;
  font-size: 14px;
  cursor: pointer;
}

.option:not(:disabled):hover {
  border-color: var(--accent-border);
  background: var(--accent-bg);
}

.option.correct {
  border-color: #4caf7d;
  background: rgba(76, 175, 125, 0.12);
}

.option.wrong {
  border-color: #e5566e;
  background: rgba(229, 86, 110, 0.12);
}

.option-key {
  flex-shrink: 0;
  font-weight: 700;
  color: var(--text-dim);
}

.explanation {
  border-top: 1px solid var(--border);
  padding-top: 16px;
  line-height: 1.7;
}

.verdict {
  font-weight: 700;
  margin-bottom: 6px;
}

.verdict.ok {
  color: #4caf7d;
}

.verdict:not(.ok) {
  color: #e5566e;
}

.primary-btn {
  margin-top: 12px;
  padding: 10px 18px;
  background: var(--accent);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
}

.score {
  font-size: 16px;
  margin-bottom: 16px;
}
</style>
