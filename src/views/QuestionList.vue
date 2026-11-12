<script setup>
// 단원 문제 목록(정보ON 방식): 소단원을 골라 범위를 좁히고, 풀고 싶은 문제를 골라 푼다.
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { renderOverlineHtml } from '../utils/richText'
import { getUnit, subunitsOf, subunitOf } from '../data'
import { markOf, unitSummary } from '../services/progress.js'
import { filteredQuestions, loadSubs, saveSubs } from '../services/subunitFilter.js'
import SolveMark from '../components/SolveMark.vue'

const props = defineProps({ unitNo: { type: String, required: true } })
const unit = computed(() => getUnit(props.unitNo))
const subunits = computed(() => subunitsOf(props.unitNo))
const route = useRoute()
// 학습자료의 '관련 문제 풀기'로 오면(?std=디논 01-02) 그 성취기준 문항의 소단원만 골라 둔다
if (route.query.std) {
  const subs = new Set(filteredQuestions(props.unitNo, []).filter((q) => q.standard_id === route.query.std).map(subunitOf))
  saveSubs(props.unitNo, subunits.value.filter((s) => subs.has(s)))
}
const picked = ref(loadSubs(props.unitNo).filter((s) => subunits.value.includes(s)))
const shown = computed(() => filteredQuestions(props.unitNo, picked.value))
const sum = computed(() => unitSummary(props.unitNo))

function toggle(s) {
  const set = new Set(picked.value)
  set.has(s) ? set.delete(s) : set.add(s)
  picked.value = subunits.value.filter((x) => set.has(x))
  saveSubs(props.unitNo, picked.value)
}
function all() {
  picked.value = []
  saveSubs(props.unitNo, [])
}
</script>

<template>
  <RouterLink :to="{ name: 'quiz-home' }" class="back">← 평가 단원 목록</RouterLink>
  <template v-if="unit">
    <h1 class="title">{{ unit.단원 }}</h1>
    <p class="summary">
      {{ sum.solved }} / {{ sum.total }}문항 풂 ·
      <SolveMark mark="o" /> {{ sum.o }} <SolveMark mark="x" /> {{ sum.x }} <SolveMark mark="?" /> {{ sum.q }}
    </p>

    <div v-if="subunits.length > 1" class="chips">
      <span class="label">소단원</span>
      <button :class="{ on: !picked.length }" @click="all">전체</button>
      <button v-for="s in subunits" :key="s" :class="{ on: picked.includes(s) }" @click="toggle(s)">{{ s }}</button>
      <span class="count">{{ shown.length }}문항</span>
    </div>

    <ol class="list">
      <li v-for="(q, i) in shown" :key="q.id">
        <RouterLink :to="{ name: 'question', params: { unitNo, qid: q.id } }" class="item">
          <span class="num">{{ i + 1 }}</span>
          <span class="stem" v-html="renderOverlineHtml(q.문제)"></span>
          <span v-if="q.세부내용" class="area">{{ q.세부내용 }}</span>
          <span v-if="q.난이도" class="level" :class="`lv-${q.난이도}`">{{ q.난이도 }}</span>
          <SolveMark :mark="markOf(q.id)" />
        </RouterLink>
      </li>
    </ol>
  </template>
  <p v-else>단원을 찾을 수 없습니다.</p>
</template>

<style scoped>
.back {
  display: inline-block;
  color: var(--text-dim);
  text-decoration: none;
  font-size: 14px;
  margin-bottom: 12px;
}
.title {
  font-size: 22px;
  margin: 0 0 6px;
}
.summary {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 5px;
  color: var(--text-dim);
  font-size: 13px;
  margin: 0 0 14px;
}
.summary :deep(.mark) {
  width: 20px;
  height: 20px;
  font-size: 11px;
  margin-left: 6px;
}
.report {
  margin-left: auto;
  color: var(--accent);
  text-decoration: none;
  font-weight: 600;
}
.chips {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  margin-bottom: 10px;
}
.label {
  font-size: 12px;
  font-weight: 700;
  color: var(--text-dim);
  margin-right: 2px;
}
.chips button {
  border: 1px solid var(--border);
  background: var(--bg);
  color: var(--text-dim);
  border-radius: 999px;
  padding: 5px 12px;
  font-size: 13px;
  cursor: pointer;
}
.chips button.on {
  color: var(--accent);
  border-color: var(--accent-border);
  background: var(--accent-bg);
  font-weight: 600;
}
.count {
  font-size: 12px;
  color: var(--text-dim);
  margin-left: 4px;
}
.list {
  list-style: none;
  margin: 0;
  padding: 0;
  border-top: 1px solid var(--border);
}
.item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 4px;
  border-bottom: 1px solid var(--border);
  color: var(--text);
  text-decoration: none;
}
.item:hover {
  background: var(--bg-soft);
}
.num {
  width: 24px;
  flex: none;
  color: var(--text-dim);
  font-size: 13px;
  text-align: right;
}
.stem {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.area {
  flex: none;
  max-width: 30%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 12px;
  color: var(--text-dim);
}
.level {
  flex: none;
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
@media (max-width: 640px) {
  .area {
    display: none;
  }
}
</style>
