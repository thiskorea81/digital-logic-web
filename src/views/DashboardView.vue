<script setup>
import { computed, ref } from 'vue'
import { units } from '../data'
import { getProgress, getWrongNotes, removeWrongNote, clearWrongNotes } from '../services/storage'
import { renderOverlineHtml } from '../utils/richText'

const progress = ref(getProgress())
const wrongNotes = ref(getWrongNotes())

const allStandards = units.flatMap((u) => u.standards)

const totals = computed(() => {
  let attempts = 0
  let correct = 0
  let studied = 0
  for (const s of allStandards) {
    const p = progress.value[s.standard_id]
    if (p) {
      attempts += p.attempts
      correct += p.correct
      studied += 1
    }
  }
  return {
    attempts,
    correct,
    studied,
    total: allStandards.length,
    accuracy: attempts ? Math.round((correct / attempts) * 100) : null,
  }
})

function progressFor(standardId) {
  return progress.value[standardId] ?? null
}

function formatDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleString('ko-KR', {
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function removeNote(i) {
  removeWrongNote(i)
  wrongNotes.value = getWrongNotes()
}

function clearNotes() {
  if (!confirm('오답노트를 모두 지울까요?')) return
  clearWrongNotes()
  wrongNotes.value = getWrongNotes()
}
</script>

<template>
  <RouterLink to="/" class="back">← 전체 단원 목록</RouterLink>
  <h1>학습 현황</h1>

  <section class="stats">
    <div class="stat-card">
      <span class="stat-num">{{ totals.studied }} / {{ totals.total }}</span>
      <span class="stat-label">학습한 성취기준</span>
    </div>
    <div class="stat-card">
      <span class="stat-num">{{ totals.attempts }}</span>
      <span class="stat-label">푼 문제 수</span>
    </div>
    <div class="stat-card">
      <span class="stat-num">{{ totals.accuracy !== null ? totals.accuracy + '%' : '—' }}</span>
      <span class="stat-label">전체 정답률</span>
    </div>
  </section>

  <section v-for="unit in units" :key="unit.단원" class="unit">
    <h2>{{ unit.단원 }}</h2>
    <ul class="standard-list">
      <li v-for="s in unit.standards" :key="s.standard_id">
        <RouterLink :to="{ name: 'material', params: { standardId: s.standard_id } }" class="standard-row">
          <span class="std-title">{{ s.title }}</span>
          <span v-if="progressFor(s.standard_id)" class="std-progress">
            {{ progressFor(s.standard_id).correct }}/{{ progressFor(s.standard_id).attempts }}
            ({{ Math.round((progressFor(s.standard_id).correct / progressFor(s.standard_id).attempts) * 100) }}%)
          </span>
          <span v-else class="std-progress muted">미학습</span>
        </RouterLink>
      </li>
    </ul>
  </section>

  <section class="wrong-notes">
    <div class="wrong-header">
      <h2>오답노트 ({{ wrongNotes.length }})</h2>
      <button v-if="wrongNotes.length" class="clear-btn" @click="clearNotes">전체 삭제</button>
    </div>
    <p v-if="!wrongNotes.length" class="empty">아직 틀린 문제가 없습니다.</p>
    <ul class="note-list">
      <li v-for="(n, i) in wrongNotes" :key="i" class="note">
        <div class="note-head">
          <RouterLink :to="{ name: 'material', params: { standardId: n.standardId } }" class="note-std">
            {{ n.standardId }}
          </RouterLink>
          <span class="note-source">{{ n.source === 'ai' ? 'AI 생성' : '기본 문제' }}</span>
          <span class="note-date">{{ formatDate(n.at) }}</span>
          <button class="note-remove" @click="removeNote(i)">삭제</button>
        </div>
        <p class="note-q" v-html="renderOverlineHtml(n.문제)"></p>
        <p class="note-answer">
          <span class="wrong-answer">내 답: {{ n.선택한답 }}</span>
          <span class="right-answer">정답: {{ n.정답 }}</span>
        </p>
        <p class="note-exp" v-html="renderOverlineHtml(n.해설)"></p>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.back {
  display: inline-block;
  color: var(--text-dim);
  text-decoration: none;
  font-size: 14px;
  margin-bottom: 16px;
}

h1 {
  font-size: 22px;
  margin-bottom: 20px;
}

.stats {
  display: flex;
  gap: 12px;
  margin-bottom: 32px;
  flex-wrap: wrap;
}

.stat-card {
  flex: 1;
  min-width: 120px;
  padding: 16px;
  border: 1px solid var(--border);
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-num {
  font-size: 22px;
  font-weight: 700;
}

.stat-label {
  font-size: 12px;
  color: var(--text-dim);
}

.unit {
  margin-bottom: 20px;
}

.unit h2 {
  font-size: 14px;
  font-weight: 700;
  color: var(--text-dim);
  margin-bottom: 8px;
}

.standard-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.standard-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 10px;
  padding: 10px 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  text-decoration: none;
  color: var(--text);
  font-size: 13px;
}

.standard-row:hover {
  border-color: var(--accent-border);
  background: var(--accent-bg);
}

.std-progress {
  flex-shrink: 0;
  font-weight: 700;
  color: var(--accent);
  font-variant-numeric: tabular-nums;
}

.std-progress.muted {
  color: var(--text-dim);
  font-weight: 400;
}

.wrong-notes {
  margin-top: 36px;
}

.wrong-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.wrong-header h2 {
  font-size: 16px;
}

.clear-btn {
  background: transparent;
  border: 1px solid var(--border);
  color: var(--text-dim);
  border-radius: 6px;
  padding: 6px 10px;
  font-size: 12px;
  cursor: pointer;
}

.empty {
  color: var(--text-dim);
  font-size: 14px;
}

.note-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.note {
  padding: 14px;
  border: 1px solid var(--border);
  border-radius: 10px;
}

.note-head {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 12px;
  color: var(--text-dim);
}

.note-std {
  color: var(--accent);
  text-decoration: none;
  font-weight: 700;
}

.note-source {
  padding: 1px 6px;
  border-radius: 999px;
  background: var(--accent-bg);
  border: 1px solid var(--accent-border);
}

.note-date {
  margin-left: auto;
}

.note-remove {
  background: transparent;
  border: none;
  color: var(--text-dim);
  cursor: pointer;
  font-size: 12px;
}

.note-remove:hover {
  color: #e5566e;
}

.note-q {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 6px;
  line-height: 1.5;
}

.note-answer {
  display: flex;
  gap: 14px;
  font-size: 13px;
  margin-bottom: 6px;
}

.wrong-answer {
  color: #e5566e;
}

.right-answer {
  color: #4caf7d;
}

.note-exp {
  font-size: 13px;
  color: var(--text-dim);
  line-height: 1.6;
}
</style>
