<script setup>
import { reactive, ref } from 'vue'
import {
  getApiKeys,
  setApiKeys,
  getAiSettings,
  setAiSettings,
  exportAllData,
  importAllData,
  clearAllData,
} from '../services/storage'
import { PROVIDER_LABELS, DEFAULT_MODELS } from '../services/ai'

const keys = reactive(getApiKeys())
const aiSettings = reactive(getAiSettings())
const savedMsg = ref('')
const importMsg = ref('')
const fileInput = ref(null)

function save() {
  setApiKeys({ ...keys })
  setAiSettings({ ...aiSettings, models: { ...aiSettings.models } })
  savedMsg.value = '저장했습니다.'
  setTimeout(() => (savedMsg.value = ''), 2000)
}

function doExport() {
  const payload = exportAllData()
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  const date = new Date().toISOString().slice(0, 10)
  a.href = url
  a.download = `digital-logic-web-backup-${date}.json`
  a.click()
  URL.revokeObjectURL(url)
}

function pickImportFile() {
  fileInput.value?.click()
}

function onImportFile(e) {
  const file = e.target.files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => {
    try {
      const payload = JSON.parse(reader.result)
      importAllData(payload)
      Object.assign(keys, getApiKeys())
      Object.assign(aiSettings, getAiSettings())
      importMsg.value = '불러오기 완료. 이 페이지의 값을 새로고침했습니다.'
    } catch (err) {
      importMsg.value = '불러오기 실패: ' + (err.message || err)
    }
    setTimeout(() => (importMsg.value = ''), 4000)
  }
  reader.readAsText(file)
  e.target.value = ''
}

function doClear() {
  if (!confirm('진행도, 오답노트, AI 생성 문제, API 키를 포함한 모든 로컬 데이터를 삭제할까요?')) return
  clearAllData()
  Object.assign(keys, getApiKeys())
  Object.assign(aiSettings, getAiSettings())
  importMsg.value = '모든 로컬 데이터를 삭제했습니다.'
  setTimeout(() => (importMsg.value = ''), 3000)
}
</script>

<template>
  <RouterLink to="/" class="back">← 전체 단원 목록</RouterLink>
  <h1>설정</h1>

  <section class="block">
    <h2>AI API 키</h2>
    <p class="note">
      입력한 키는 이 브라우저의 localStorage에만 저장되며, 어디에도 전송되지 않습니다(문제 생성 시
      선택한 AI 제공사 서버로만 직접 요청이 나갑니다). 다만 브라우저 개발자 도구로 값을 볼 수 있고
      네트워크 요청에도 그대로 실리므로, 개인 기기 이외에서는 사용하지 마세요.
    </p>

    <div class="field">
      <label>사용할 AI</label>
      <select v-model="aiSettings.provider">
        <option v-for="(label, key) in PROVIDER_LABELS" :key="key" :value="key">{{ label }}</option>
      </select>
    </div>

    <div class="field" v-for="(label, key) in PROVIDER_LABELS" :key="key">
      <label>{{ label }} API 키</label>
      <input v-model="keys[key]" type="password" autocomplete="off" placeholder="sk-... / AIza... 등" />
      <label class="model-label">모델명</label>
      <input v-model="aiSettings.models[key]" type="text" :placeholder="DEFAULT_MODELS[key]" />
    </div>

    <button class="primary-btn" @click="save">저장</button>
    <span v-if="savedMsg" class="msg">{{ savedMsg }}</span>
  </section>

  <section class="block">
    <h2>데이터 내보내기 / 불러오기</h2>
    <p class="note">
      학습 진행도, 오답노트, AI로 생성한 문제, API 키는 이 브라우저에만 저장됩니다. 다른 기기나
      브라우저로 옮기려면 아래에서 내보내기/불러오기를 사용하세요. 내보낸 파일에는 API 키가 그대로
      포함되니 다른 사람과 공유하지 마세요.
    </p>
    <div class="btn-row">
      <button class="primary-btn" @click="doExport">내보내기 (JSON 다운로드)</button>
      <button class="secondary-btn" @click="pickImportFile">불러오기 (JSON 업로드)</button>
      <input ref="fileInput" type="file" accept="application/json" class="hidden-input" @change="onImportFile" />
    </div>
    <p v-if="importMsg" class="msg">{{ importMsg }}</p>
  </section>

  <section class="block danger">
    <h2>모든 로컬 데이터 삭제</h2>
    <p class="note">진행도, 오답노트, AI 생성 문제, API 키를 이 브라우저에서 전부 지웁니다.</p>
    <button class="danger-btn" @click="doClear">전체 삭제</button>
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

.block {
  margin-bottom: 32px;
  padding: 18px;
  border: 1px solid var(--border);
  border-radius: 10px;
}

.block h2 {
  font-size: 15px;
  margin-bottom: 8px;
}

.note {
  color: var(--text-dim);
  font-size: 13px;
  line-height: 1.6;
  margin-bottom: 14px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 14px;
}

.field label {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-dim);
}

.model-label {
  margin-top: 6px;
}

.field input,
.field select {
  padding: 8px 10px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--bg);
  color: var(--text);
  font-size: 14px;
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

.secondary-btn {
  padding: 10px 18px;
  background: var(--bg-soft);
  color: var(--text);
  border: 1px solid var(--border);
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
}

.danger-btn {
  padding: 10px 18px;
  background: transparent;
  color: #e5566e;
  border: 1px solid #e5566e;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
}

.btn-row {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.hidden-input {
  display: none;
}

.msg {
  display: inline-block;
  margin-top: 10px;
  font-size: 13px;
  color: var(--accent);
}

.block.danger {
  border-color: rgba(229, 86, 110, 0.4);
}
</style>
