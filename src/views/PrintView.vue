<script setup>
import { computed, reactive, ref } from 'vue'
import { units, getMaterial, getQuestions } from '../data'
import { parsePipeTable } from '../utils/markdownTable'
import { renderOverlineHtml, renderRichText, extractClozeSentences } from '../utils/richText'
import { isPrintUnlocked, unlockPrint } from '../services/storage'

const PASSWORD = '1111'

const unlocked = ref(isPrintUnlocked())
const pwInput = ref('')
const pwError = ref('')

function tryUnlock() {
  if (pwInput.value === PASSWORD) {
    unlockPrint()
    unlocked.value = true
  } else {
    pwError.value = '비밀번호가 올바르지 않습니다.'
  }
}

const allStandards = units.flatMap((u) => u.standards.map((s) => ({ ...s, 단원: u.단원 })))

const mode = ref('blank') // 'blank' | 'highlight'
const printType = ref('full') // 'full' | 'summary' | 'questions'
const includeAdvanced = ref(false)
const includeSolvingSpace = ref(true)
const selected = reactive(new Set(allStandards.map((s) => s.standard_id)))

function toggleAll(checked) {
  selected.clear()
  if (checked) allStandards.forEach((s) => selected.add(s.standard_id))
}

function toggleOne(id) {
  if (selected.has(id)) selected.delete(id)
  else selected.add(id)
}

const includedStandards = computed(() => allStandards.filter((s) => selected.has(s.standard_id)))

function visibleSections(material) {
  if (!material) return []
  return includeAdvanced.value ? material.sections : material.sections.filter((sec) => !sec.advanced)
}

function sectionTable(s) {
  return parsePipeTable(s.표)
}

function summaryGroups(material) {
  if (!material) return []
  return visibleSections(material)
    .map((s) => ({ heading: s.heading, sentences: extractClozeSentences(s.content) }))
    .filter((g) => g.sentences.length > 0)
}

function renderContent(text) {
  return renderRichText(text, mode.value === 'highlight' ? 'highlight' : 'blank')
}

const printTypeLabel = computed(() => {
  if (printType.value === 'summary') return '핵심정리 빈칸 채우기'
  if (printType.value === 'questions') return '문제만'
  return null
})

function doPrint() {
  window.print()
}
</script>

<template>
  <div v-if="!unlocked" class="gate">
    <h1>인쇄용 학습지</h1>
    <p class="gate-note">비밀번호를 입력하세요.</p>
    <div class="gate-form">
      <input
        v-model="pwInput"
        type="password"
        placeholder="비밀번호"
        @keyup.enter="tryUnlock"
      />
      <button class="primary-btn" @click="tryUnlock">확인</button>
    </div>
    <p v-if="pwError" class="gate-error">{{ pwError }}</p>
  </div>

  <template v-else>
    <div class="no-print">
      <RouterLink to="/" class="back">← 전체 단원 목록</RouterLink>
      <h1>인쇄용 학습지</h1>

      <div class="toolbar">
        <div class="toolbar-row">
          <span class="toolbar-label">모드</span>
          <label><input type="radio" value="blank" v-model="mode" /> 빈칸 인쇄용 (정답은 맨 뒤에)</label>
          <label><input type="radio" value="highlight" v-model="mode" /> 정답 확인용 (빈칸 단어 강조 표시)</label>
        </div>
        <div class="toolbar-row">
          <span class="toolbar-label">구성</span>
          <label><input type="radio" value="full" v-model="printType" /> 전체 (학습자료 + 문제)</label>
          <label><input type="radio" value="summary" v-model="printType" /> 핵심정리 빈칸 채우기만</label>
          <label><input type="radio" value="questions" v-model="printType" /> 문제만</label>
        </div>
        <div class="toolbar-row">
          <label><input type="checkbox" v-model="includeAdvanced" /> 심화 학습 내용 포함</label>
          <label><input type="checkbox" v-model="includeSolvingSpace" /> 풀이 공간 포함</label>
        </div>
        <div class="toolbar-row standards-picker">
          <span class="toolbar-label">포함할 성취기준</span>
          <label><input type="checkbox" :checked="selected.size === allStandards.length" @change="toggleAll($event.target.checked)" /> 전체</label>
          <label v-for="s in allStandards" :key="s.standard_id">
            <input type="checkbox" :checked="selected.has(s.standard_id)" @change="toggleOne(s.standard_id)" />
            [{{ s.standard_id.replace('디논 ', '') }}]
          </label>
        </div>
        <button class="print-btn" @click="doPrint">🖨️ 인쇄하기</button>
      </div>
    </div>

    <div class="worksheet">
      <header class="worksheet-header">
        <h1>디지털논리회로 학습노트</h1>
        <p class="mode-tag">
          {{ mode === 'highlight' ? '[정답 확인용]' : '[빈칸 인쇄용]' }}<template v-if="printTypeLabel"> · [{{ printTypeLabel }}]</template>
        </p>
        <p v-if="printType !== 'questions'" class="cloze-note">
          {{
            mode === 'highlight'
              ? '색으로 강조된 부분이 빈칸 인쇄용 학습지에서는 빈칸으로 나옵니다.'
              : '밑줄 친 빈칸에 알맞은 핵심 용어를 채워 넣으며 학습하세요.'
          }}
        </p>
        <div v-if="mode === 'blank'" class="name-fields">
          <span>이름: ______________</span>
          <span>날짜: ______________</span>
        </div>
      </header>

      <section v-for="std in includedStandards" :key="std.standard_id" class="standard-block">
        <h2>[{{ std.standard_id }}] {{ getMaterial(std.standard_id)?.title ?? std.title }}</h2>
        <p class="std-desc">{{ std.성취기준명 }}</p>

        <template v-if="printType === 'summary'">
          <div v-if="summaryGroups(getMaterial(std.standard_id)).length" class="summary">
            <template v-for="(g, gi) in summaryGroups(getMaterial(std.standard_id))" :key="gi">
              <h3 v-html="renderOverlineHtml(g.heading)"></h3>
              <ul class="summary-list">
                <li v-for="(sentence, si) in g.sentences" :key="si" v-html="renderContent(sentence)"></li>
              </ul>
            </template>
          </div>
          <p v-else class="no-material">(이 성취기준에는 빈칸으로 뽑을 학습자료가 없습니다.)</p>
        </template>

        <template v-if="printType === 'full'">
          <div v-if="getMaterial(std.standard_id)" class="material">
            <template v-for="(s, i) in visibleSections(getMaterial(std.standard_id))" :key="i">
              <h3 v-html="renderOverlineHtml(s.heading)"></h3>
              <p class="content" v-html="renderContent(s.content)"></p>
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
              <pre v-if="s.code" class="code-block"><code>{{ s.code }}</code></pre>
            </template>
          </div>
          <p v-else class="no-material">(이 성취기준에는 아직 학습자료가 없습니다.)</p>
        </template>

        <div
          v-if="printType !== 'summary' && getQuestions(std.standard_id).length"
          class="questions"
          :class="{ 'page-split': printType === 'full' && getMaterial(std.standard_id) }"
        >
          <div v-for="(q, qi) in getQuestions(std.standard_id)" :key="q.id" class="question-block">
            <p class="q-stem"><span class="q-num">{{ qi + 1 }}.</span> <span v-html="renderOverlineHtml(q.문제)"></span></p>

            <table v-if="parsePipeTable(q.표)" class="section-table">
              <thead>
                <tr>
                  <th v-for="(h, hi) in parsePipeTable(q.표).headers" :key="hi" v-html="renderOverlineHtml(h)"></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(row, ri) in parsePipeTable(q.표).rows" :key="ri">
                  <td v-for="(cell, ci) in row" :key="ci" v-html="renderOverlineHtml(cell)"></td>
                </tr>
              </tbody>
            </table>
            <div v-if="q.이미지" class="diagram" v-html="q.이미지"></div>
            <pre v-if="q.코드" class="code-block"><code>{{ q.코드 }}</code></pre>

            <ol class="choices">
              <li v-for="(text, num) in q.선택지" :key="num" v-html="renderOverlineHtml(text)"></li>
            </ol>

            <div v-if="includeSolvingSpace" class="solving-space">
              <span class="solving-label">풀이</span>
            </div>

            <div v-if="mode === 'highlight'" class="answer-box">
              <strong>정답: {{ q.정답 }}번</strong>
              <p v-if="q.해설" v-html="renderOverlineHtml(q.해설)"></p>
            </div>
          </div>
        </div>
      </section>

      <section v-if="mode === 'blank' && printType !== 'summary'" class="answer-key">
        <h2>정답 및 해설</h2>
        <div v-for="std in includedStandards" :key="std.standard_id" class="answer-key-block">
          <h3>[{{ std.standard_id }}] {{ getMaterial(std.standard_id)?.title ?? std.title }}</h3>
          <table class="section-table">
            <thead>
              <tr>
                <th>번호</th>
                <th>정답</th>
                <th>해설</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(q, qi) in getQuestions(std.standard_id)" :key="q.id">
                <td>{{ qi + 1 }}</td>
                <td>{{ q.정답 }}번</td>
                <td v-html="renderOverlineHtml(q.해설)"></td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  </template>
</template>

<style scoped>
.gate {
  max-width: 340px;
  margin: 80px auto;
  text-align: center;
}

.gate-note {
  color: var(--text-dim);
  font-size: 14px;
  margin-bottom: 16px;
}

.gate-form {
  display: flex;
  gap: 8px;
}

.gate-form input {
  flex: 1;
  padding: 10px 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--bg);
  color: var(--text);
  font-size: 14px;
}

.gate-error {
  margin-top: 10px;
  color: #e5566e;
  font-size: 13px;
}

.back {
  display: inline-block;
  color: var(--text-dim);
  text-decoration: none;
  font-size: 14px;
  margin-bottom: 12px;
}

.toolbar {
  margin: 16px 0 24px;
  padding: 16px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--bg-soft);
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.toolbar-row {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
  font-size: 14px;
}

.toolbar-label {
  font-weight: 600;
  color: var(--text-dim);
  font-size: 13px;
}

.standards-picker label {
  font-family: ui-monospace, monospace;
  font-size: 13px;
}

.print-btn {
  align-self: flex-start;
  background: var(--accent);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 22px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
}

.primary-btn {
  padding: 10px 18px;
  background: var(--accent);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
}

/* ---- 인쇄물 본문: 화면/인쇄 모두 흰 종이 위 검은 글씨로 고정 ---- */
.worksheet {
  background: #ffffff;
  color: #18181b;
  padding: 24px;
  border: 1px solid var(--border);
  border-radius: 10px;
  max-width: 860px;
}

.worksheet-header {
  border-bottom: 2px solid #18181b;
  padding-bottom: 12px;
  margin-bottom: 20px;
}

.worksheet-header h1 {
  color: #18181b;
  font-size: 22px;
  margin: 0 0 4px;
}

.mode-tag {
  font-weight: 700;
  color: #18181b;
  margin: 0 0 10px;
}

.name-fields {
  display: flex;
  gap: 28px;
  font-size: 14px;
  color: #18181b;
}

.cloze-note {
  font-size: 12px;
  color: #52525b;
  margin: 0 0 10px;
}

.standard-block {
  margin-bottom: 36px;
}

.standard-block h2 {
  color: #18181b;
  font-size: 18px;
  border-bottom: 1px solid #d4d4d8;
  padding-bottom: 6px;
}

.std-desc {
  color: #52525b;
  font-size: 13px;
  margin-bottom: 14px;
}

.material h3 {
  color: #18181b;
  font-size: 15px;
  font-weight: 400;
  margin: 16px 0 6px;
  break-after: avoid-page;
  page-break-after: avoid;
}

.content {
  white-space: pre-wrap;
  line-height: 1.7;
  font-size: 14px;
  margin: 0 0 8px;
}

.content :deep(.cloze-blank),
.summary-list :deep(.cloze-blank) {
  display: inline-block;
  border-bottom: 1.5px solid #18181b;
  min-height: 1em;
  vertical-align: baseline;
  margin: 0 2px;
}

.content :deep(mark.cloze),
.summary-list :deep(mark.cloze) {
  background: #fef08a;
  color: #18181b;
  padding: 0 3px;
  border-radius: 2px;
  font-weight: 700;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

.content :deep(.bar),
.summary-list :deep(.bar),
.section-table :deep(.bar),
.q-stem :deep(.bar),
.choices :deep(.bar) {
  text-decoration: overline;
}

.summary h3 {
  color: #18181b;
  font-size: 15px;
  font-weight: 400;
  margin: 14px 0 4px;
  break-after: avoid-page;
  page-break-after: avoid;
}

.summary-list {
  margin: 0 0 6px;
  padding-left: 20px;
  font-size: 14px;
  line-height: 1.9;
}

.summary-list li {
  break-inside: avoid;
}

.section-table {
  border-collapse: collapse;
  width: 100%;
  margin: 10px 0;
  font-size: 13px;
}

.section-table th,
.section-table td {
  border: 1px solid #a1a1aa;
  padding: 6px 8px;
  text-align: left;
}

.diagram {
  margin: 10px 0;
  overflow-x: auto;
}

.diagram :deep(svg) {
  display: block;
  max-width: 100%;
  height: auto;
}

.code-block {
  background: #f4f4f5;
  border: 1px solid #d4d4d8;
  border-radius: 6px;
  padding: 10px 12px;
  font-size: 13px;
  overflow-x: auto;
  margin: 8px 0;
}

.no-material {
  color: #a1a1aa;
  font-size: 13px;
  font-style: italic;
}

.question-block {
  margin: 18px 0;
  break-inside: avoid;
}

.q-stem {
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 6px;
  white-space: pre-wrap;
}

.q-num {
  margin-right: 4px;
}

.choices {
  list-style: decimal;
  margin: 6px 0 6px 22px;
  padding: 0;
  font-size: 14px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.solving-space {
  position: relative;
  margin: 10px 0 4px;
  min-height: 80px;
  border: 1px dashed #a1a1aa;
  border-radius: 4px;
}

.solving-label {
  position: absolute;
  top: 4px;
  left: 8px;
  font-size: 11px;
  color: #a1a1aa;
}

.answer-box {
  margin-top: 8px;
  padding: 8px 12px;
  border-left: 3px solid #dc2626;
  background: #fef2f2;
  color: #b91c1c;
  font-size: 13px;
}

.answer-box p {
  margin: 4px 0 0;
  color: #b91c1c;
}

.answer-key {
  margin-top: 40px;
  padding-top: 20px;
  border-top: 2px solid #18181b;
  break-before: page;
}

.answer-key h2 {
  color: #18181b;
}

.answer-key-block {
  margin-bottom: 20px;
}

.answer-key-block h3 {
  font-size: 14px;
  color: #18181b;
}

@media print {
  .no-print {
    display: none !important;
  }

  .worksheet {
    border: none;
    border-radius: 0;
    max-width: none;
    padding: 0;
  }

  .standard-block {
    break-before: page;
  }

  .standard-block:first-of-type {
    break-before: auto;
  }

  .questions.page-split {
    break-before: page;
  }
}
</style>
