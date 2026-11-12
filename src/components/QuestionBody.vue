<script setup>
// 문제 본문: 문제 글·회로도/그림(SVG)·표·코드. 보수 기호(윗줄)는 renderOverlineHtml로 그린다.
import { computed } from 'vue'
import { parsePipeTable } from '../utils/markdownTable'
import { renderOverlineHtml } from '../utils/richText'

const props = defineProps({ question: { type: Object, required: true } })
const table = computed(() => parsePipeTable(props.question.표))
</script>

<template>
  <h1 class="question" v-html="renderOverlineHtml(question.문제)"></h1>
  <div v-if="question.이미지" class="q-image" v-html="question.이미지"></div>
  <table v-if="table" class="q-table">
    <thead>
      <tr>
        <th v-for="(h, hi) in table.headers" :key="hi" v-html="renderOverlineHtml(h)"></th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(row, ri) in table.rows" :key="ri">
        <td v-for="(cell, ci) in row" :key="ci" v-html="renderOverlineHtml(cell)"></td>
      </tr>
    </tbody>
  </table>
  <pre v-if="question.코드" class="q-code"><code>{{ question.코드 }}</code></pre>
</template>

<style scoped>
.question {
  font-size: 18px;
  line-height: 1.6;
  margin: 0 0 16px;
  white-space: pre-line;
}
.q-image {
  max-width: 100%;
  margin: 0 0 16px;
}
.q-image :deep(svg) {
  max-width: 100%;
  height: auto;
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
.q-code {
  background: var(--code-bg);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 12px;
  overflow-x: auto;
  font-size: 13px;
  margin: 0 0 16px;
}
</style>
