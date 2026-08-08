<script setup>
import { units } from '../data'
import { getProgress } from '../services/storage'

const progress = getProgress()

function chip(standardId) {
  const p = progress[standardId]
  if (!p) return null
  return `${p.correct}/${p.attempts}`
}
</script>

<template>
  <p class="intro">
    고등학교 '디지털논리회로' 과목의 학습자료와 자가 진단(객관식) 문제를 단원별로 정리했습니다.
    자료를 먼저 읽고, 관련 문제로 이해도를 점검해 보세요.
  </p>

  <nav class="quick-links">
    <RouterLink to="/dashboard">📊 학습 현황·오답노트</RouterLink>
    <RouterLink to="/print">🖨️ 인쇄용 학습지</RouterLink>
    <RouterLink to="/settings">⚙️ 설정 (AI 키·백업)</RouterLink>
  </nav>

  <section v-for="unit in units" :key="unit.단원" class="unit">
    <h2>{{ unit.단원 }}</h2>
    <ul class="standard-list">
      <li v-for="s in unit.standards" :key="s.standard_id">
        <RouterLink :to="{ name: 'material', params: { standardId: s.standard_id } }" class="standard-link">
          <span class="std-id">{{ s.standard_id.replace('디논 ', '') }}</span>
          <span class="std-title">{{ s.title }}</span>
          <span v-if="chip(s.standard_id)" class="std-chip">{{ chip(s.standard_id) }}</span>
        </RouterLink>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.intro {
  color: var(--text-dim);
  line-height: 1.7;
  margin-bottom: 20px;
}

.quick-links {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 28px;
}

.quick-links a {
  padding: 8px 14px;
  border: 1px solid var(--border);
  border-radius: 999px;
  text-decoration: none;
  color: var(--text);
  font-size: 13px;
}

.quick-links a:hover {
  border-color: var(--accent-border);
  background: var(--accent-bg);
}

.unit {
  margin-bottom: 28px;
}

.unit h2 {
  font-size: 15px;
  font-weight: 700;
  color: var(--text-dim);
  margin-bottom: 10px;
}

.standard-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.standard-link {
  display: flex;
  align-items: baseline;
  gap: 10px;
  padding: 12px 14px;
  border: 1px solid var(--border);
  border-radius: 10px;
  text-decoration: none;
  color: var(--text);
  transition: border-color 0.15s, background 0.15s;
}

.standard-link:hover {
  border-color: var(--accent-border);
  background: var(--accent-bg);
}

.std-id {
  flex-shrink: 0;
  font-size: 12px;
  font-weight: 700;
  color: var(--accent);
  font-variant-numeric: tabular-nums;
}

.std-title {
  font-size: 14px;
  flex: 1;
}

.std-chip {
  flex-shrink: 0;
  font-size: 11px;
  font-weight: 700;
  color: var(--text-dim);
  font-variant-numeric: tabular-nums;
}
</style>
