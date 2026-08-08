<script setup>
import { computed } from 'vue'
import { getMaterial, getQuestions, units } from '../data'
import { parsePipeTable } from '../utils/markdownTable'
import { renderOverlineHtml, renderRichText } from '../utils/richText'

const props = defineProps({
  standardId: { type: String, required: true },
})

const material = computed(() => getMaterial(props.standardId))
const questionCount = computed(() => getQuestions(props.standardId).length)

const siblings = computed(() => {
  const unit = units.find((u) => u.standards.some((s) => s.standard_id === props.standardId))
  return unit ? unit.standards : []
})

const currentIndex = computed(() =>
  siblings.value.findIndex((s) => s.standard_id === props.standardId)
)

const prevStandard = computed(() =>
  currentIndex.value > 0 ? siblings.value[currentIndex.value - 1] : null
)

const nextStandard = computed(() =>
  currentIndex.value !== -1 && currentIndex.value < siblings.value.length - 1
    ? siblings.value[currentIndex.value + 1]
    : null
)

function sectionTable(s) {
  return parsePipeTable(s.표)
}
</script>

<template>
  <RouterLink to="/" class="back">← 전체 단원 목록</RouterLink>

  <template v-if="material">
    <h1>{{ material.title }}</h1>
    <p class="std-name">[{{ material.standard_id }}] {{ material.성취기준명 }}</p>

    <template v-for="(s, i) in material.sections" :key="i">
      <div v-if="s.advanced && !material.sections[i - 1]?.advanced" class="advanced-divider">
        <span>심화 학습</span>
      </div>
      <section class="section" :class="{ advanced: s.advanced }">
        <h2>
          <span v-html="renderOverlineHtml(s.heading)"></span>
          <span v-if="s.advanced" class="advanced-badge">심화</span>
        </h2>
        <p class="content" v-html="renderRichText(s.content, 'highlight')"></p>
        <table v-if="sectionTable(s)" class="section-table">
          <thead>
            <tr>
              <th v-for="(h, hi) in sectionTable(s).headers" :key="hi" v-html="renderOverlineHtml(h)"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, ri) in sectionTable(s).rows" :key="ri">
              <td v-for="(cell, ci) in row" :key="ci" v-html="renderOverlineHtml(cell)"></td>
            </tr>
          </tbody>
        </table>
        <div v-if="s.image" class="diagram" v-html="s.image"></div>
        <div v-if="s.code" class="code-block-wrap">
          <span class="col-label">예제 코드</span>
          <pre class="code-block"><code>{{ s.code }}</code></pre>
        </div>
      </section>
    </template>

    <RouterLink
      v-if="questionCount > 0"
      :to="{ name: 'quiz', params: { standardId: material.standard_id } }"
      class="practice-link"
    >
      관련 문제 풀어보기 ({{ questionCount }}문항) →
    </RouterLink>

    <nav class="material-nav">
      <RouterLink
        v-if="prevStandard"
        :to="{ name: 'material', params: { standardId: prevStandard.standard_id } }"
        class="nav-link"
      >
        ← {{ prevStandard.title }}
      </RouterLink>
      <span v-else></span>
      <RouterLink
        v-if="nextStandard"
        :to="{ name: 'material', params: { standardId: nextStandard.standard_id } }"
        class="nav-link next"
      >
        {{ nextStandard.title }} →
      </RouterLink>
    </nav>
  </template>
  <p v-else>자료를 찾을 수 없습니다.</p>
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
  margin-bottom: 6px;
}

.std-name {
  color: var(--text-dim);
  font-size: 14px;
  margin-bottom: 24px;
}

.section {
  margin-bottom: 28px;
}

.section h2 {
  font-size: 17px;
  font-weight: 600;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.section.advanced {
  border-left: 3px solid var(--accent-border);
  padding-left: 16px;
}

.advanced-badge {
  font-size: 11px;
  font-weight: 700;
  padding: 2px 9px;
  border-radius: 999px;
  color: var(--accent);
  border: 1px solid var(--accent-border);
  background: var(--accent-bg);
}

.advanced-divider {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 32px 0 20px;
  font-size: 13px;
  font-weight: 700;
  color: var(--accent);
}

.advanced-divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--accent-border);
}

.content {
  white-space: pre-wrap;
  line-height: 1.75;
  margin-bottom: 12px;
}

.section h2 :deep(.bar),
.content :deep(.bar),
.section-table :deep(.bar) {
  text-decoration: overline;
  text-decoration-thickness: 1px;
}

.content :deep(mark.cloze) {
  background: none;
  color: var(--accent);
  font-weight: 700;
}

.section-table {
  border-collapse: collapse;
  width: 100%;
  margin: 12px 0;
  font-size: 14px;
  display: block;
  overflow-x: auto;
}

.section-table th,
.section-table td {
  border: 1px solid var(--border);
  padding: 8px 10px;
  text-align: center;
}

.section-table th {
  background: var(--bg-soft);
}

.diagram {
  margin: 16px 0;
  overflow-x: auto;
}

.diagram :deep(svg) {
  display: block;
  max-width: 100%;
  height: auto;
}

.code-block-wrap {
  margin: 12px 0;
}

.col-label {
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-dim);
  margin-bottom: 6px;
}

.code-block {
  background: var(--code-bg);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 12px;
  margin: 0;
  overflow-x: auto;
  font-size: 13px;
  line-height: 1.5;
}

.practice-link {
  display: inline-block;
  margin: 8px 0 32px;
  padding: 12px 20px;
  background: var(--accent);
  color: white;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  font-size: 14px;
}

.material-nav {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  border-top: 1px solid var(--border);
  padding-top: 16px;
}

.nav-link {
  color: var(--text-dim);
  text-decoration: none;
  font-size: 13px;
}

.nav-link:hover {
  color: var(--accent);
}

.nav-link.next {
  text-align: right;
}
</style>
