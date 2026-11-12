<script setup>
// 평가: 단원을 고르면 문제 목록(소단원 고르기·문제 골라 풀기)으로
import { units, getReviewQuestions } from '../data'
import { unitSummary } from '../services/progress.js'
import SolveMark from '../components/SolveMark.vue'
</script>

<template>
  <h1 class="page-title">평가</h1>
  <p class="hint">단원을 고른 뒤, 소단원을 골라 풀고 싶은 문제부터 풀어 보세요. 풀면 문제 옆에 O·X가, 헷갈린다고 표시하면 ?가 붙어요.</p>
  <ul class="units">
    <template v-for="u in units" :key="u.no">
      <li v-if="getReviewQuestions(u.no).length">
        <RouterLink :to="{ name: 'quiz', params: { unitNo: u.no } }" class="unit">
          <span class="name">{{ u.단원 }}</span>
          <span class="stat">
            {{ unitSummary(u.no).solved }} / {{ unitSummary(u.no).total }}문항 풂
            <SolveMark mark="o" /> {{ unitSummary(u.no).o }}
            <SolveMark mark="x" /> {{ unitSummary(u.no).x }}
            <SolveMark mark="?" /> {{ unitSummary(u.no).q }}
          </span>
        </RouterLink>
      </li>
    </template>
  </ul>
</template>

<style scoped>
.page-title {
  font-size: 24px;
  margin: 0 0 8px;
}
.hint {
  color: var(--text-dim);
  font-size: 14px;
  line-height: 1.6;
  margin: 0 0 20px;
}
.units {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 10px;
}
.unit {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 16px 18px;
  border: 1px solid var(--border);
  border-radius: 12px;
  color: var(--text);
  text-decoration: none;
}
.unit:hover {
  border-color: var(--accent-border);
  background: var(--accent-bg);
}
.name {
  font-weight: 700;
}
.stat {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: var(--text-dim);
  font-size: 13px;
}
.stat :deep(.mark) {
  width: 20px;
  height: 20px;
  font-size: 11px;
  margin-left: 6px;
}
</style>
