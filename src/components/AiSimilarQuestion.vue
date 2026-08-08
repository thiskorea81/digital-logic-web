<script setup>
import { computed, ref } from 'vue'
import { generateSimilarQuestion, PROVIDER_LABELS, DEFAULT_MODELS } from '../services/ai'
import { getApiKeys, getAiSettings, addAiQuestion, recordAttempt, addWrongNote } from '../services/storage'
import { renderOverlineHtml } from '../utils/richText'

const props = defineProps({
  standardId: { type: String, required: true },
  baseQuestion: { type: Object, required: true },
})

const loading = ref(false)
const error = ref('')
const generated = ref(null)
const selected = ref(null)
const revealed = ref(false)

const settings = computed(() => getAiSettings())
const providerLabel = computed(() => PROVIDER_LABELS[settings.value.provider] ?? settings.value.provider)

async function generate() {
  loading.value = true
  error.value = ''
  generated.value = null
  selected.value = null
  revealed.value = false
  try {
    const keys = getApiKeys()
    const s = getAiSettings()
    const apiKey = keys[s.provider]
    const model = s.models?.[s.provider] ?? DEFAULT_MODELS[s.provider]
    const q = await generateSimilarQuestion({
      provider: s.provider,
      apiKey,
      model,
      baseQuestion: props.baseQuestion,
    })
    generated.value = q
    addAiQuestion(props.standardId, q)
  } catch (e) {
    error.value = e.message || String(e)
  } finally {
    loading.value = false
  }
}

function choose(key) {
  if (revealed.value) return
  selected.value = key
  revealed.value = true
  const isCorrect = Number(key) === generated.value.정답
  recordAttempt(props.standardId, generated.value.id, isCorrect)
  if (!isCorrect) {
    addWrongNote({
      standardId: props.standardId,
      questionId: generated.value.id,
      문제: generated.value.문제,
      선택한답: generated.value.선택지?.[key] ?? String(key),
      정답: generated.value.선택지?.[generated.value.정답] ?? String(generated.value.정답),
      해설: generated.value.해설,
      source: 'ai',
    })
  }
}
</script>

<template>
  <div class="ai-box">
    <div class="ai-header">
      <span class="ai-label">AI 유사 문제 ({{ providerLabel }})</span>
      <button class="ai-btn" :disabled="loading" @click="generate">
        {{ loading ? '생성 중…' : generated ? '다시 생성' : 'AI로 비슷한 문제 만들기' }}
      </button>
    </div>

    <p v-if="error" class="ai-error">
      {{ error }}
      <RouterLink to="/settings">설정에서 API 키 확인하기 →</RouterLink>
    </p>

    <div v-if="generated" class="ai-question">
      <p class="ai-tag">AI가 생성한 문제입니다 — 오류가 있을 수 있으니 참고용으로 활용하세요.</p>
      <p class="q-stem" v-html="renderOverlineHtml(generated.문제)"></p>
      <ul class="options">
        <li v-for="(text, key) in generated.선택지" :key="key">
          <button
            class="option"
            :class="{
              correct: revealed && Number(key) === generated.정답,
              wrong: revealed && String(selected) === String(key) && Number(key) !== generated.정답,
            }"
            :disabled="revealed"
            @click="choose(key)"
          >
            <span class="option-key">{{ key }}</span>
            <span v-html="renderOverlineHtml(text)"></span>
          </button>
        </li>
      </ul>
      <div v-if="revealed" class="ai-explanation">
        <p class="verdict" :class="{ ok: Number(selected) === generated.정답 }">
          {{ Number(selected) === generated.정답 ? '정답입니다' : '오답입니다' }}
          (정답: {{ generated.정답 }}번)
        </p>
        <p v-html="renderOverlineHtml(generated.해설)"></p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ai-box {
  margin-top: 24px;
  padding: 16px;
  border: 1px dashed var(--accent-border);
  border-radius: 10px;
  background: var(--accent-bg);
}

.ai-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
}

.ai-label {
  font-size: 12px;
  font-weight: 700;
  color: var(--accent);
}

.ai-btn {
  background: var(--accent);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 8px 14px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.ai-btn:disabled {
  opacity: 0.6;
  cursor: default;
}

.ai-error {
  margin-top: 10px;
  font-size: 13px;
  color: #e5566e;
}

.ai-error a {
  color: var(--accent);
}

.ai-question {
  margin-top: 14px;
}

.ai-tag {
  font-size: 11px;
  color: var(--text-dim);
  margin-bottom: 8px;
}

.q-stem {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 10px;
  line-height: 1.5;
}

.options {
  list-style: none;
  margin: 0 0 10px;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.option {
  width: 100%;
  display: flex;
  align-items: baseline;
  gap: 10px;
  padding: 10px 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--bg);
  color: var(--text);
  text-align: left;
  font-size: 13px;
  cursor: pointer;
}

.option:not(:disabled):hover {
  border-color: var(--accent-border);
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

.ai-explanation {
  padding-top: 10px;
  border-top: 1px solid var(--border);
  font-size: 13px;
  line-height: 1.6;
}

.verdict {
  font-weight: 700;
  margin-bottom: 4px;
}

.verdict.ok {
  color: #4caf7d;
}

.verdict:not(.ok) {
  color: #e5566e;
}
</style>
