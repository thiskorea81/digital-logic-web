// 백엔드 없이 브라우저 localStorage만으로 사용자별 상태(진행도, API 키, AI 생성 문제 등)를
// 관리한다. 모든 키는 "dlw:" 네임스페이스를 쓴다.
const PREFIX = 'dlw:'

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(PREFIX + key)
    return raw === null ? fallback : JSON.parse(raw)
  } catch {
    return fallback
  }
}

function write(key, value) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value))
  } catch (e) {
    console.error('localStorage 저장 실패:', e)
  }
}

// ---- API 키 ----
export function getApiKeys() {
  return read('apiKeys', { openai: '', gemini: '', claude: '' })
}

export function setApiKeys(keys) {
  write('apiKeys', keys)
}

export function getAiSettings() {
  return read('aiSettings', {
    provider: 'gemini',
    models: {
      openai: 'gpt-4o-mini',
      gemini: 'gemini-2.5-flash',
      claude: 'claude-haiku-4-5-20251001',
    },
  })
}

export function setAiSettings(settings) {
  write('aiSettings', settings)
}

// ---- 학습 진행도: standard_id -> { attempts, correct, lastAt } ----
export function getProgress() {
  return read('progress', {})
}

export function recordAttempt(standardId, questionId, isCorrect) {
  const progress = getProgress()
  const cur = progress[standardId] ?? { attempts: 0, correct: 0, lastAt: null }
  cur.attempts += 1
  if (isCorrect) cur.correct += 1
  cur.lastAt = new Date().toISOString()
  progress[standardId] = cur
  write('progress', progress)
}

// ---- 오답노트: [{ standardId, questionId, 문제, 선택한답, 정답, 해설, at, source }] ----
export function getWrongNotes() {
  return read('wrongNotes', [])
}

export function addWrongNote(note) {
  const notes = getWrongNotes()
  notes.unshift({ ...note, at: new Date().toISOString() })
  write('wrongNotes', notes.slice(0, 300))
}

export function removeWrongNote(index) {
  const notes = getWrongNotes()
  notes.splice(index, 1)
  write('wrongNotes', notes)
}

export function clearWrongNotes() {
  write('wrongNotes', [])
}

// ---- AI가 생성한 유사 문제 캐시: standard_id -> generatedQuestion[] ----
export function getAiQuestions(standardId) {
  const all = read('aiQuestions', {})
  return all[standardId] ?? []
}

export function addAiQuestion(standardId, question) {
  const all = read('aiQuestions', {})
  all[standardId] = [...(all[standardId] ?? []), question]
  write('aiQuestions', all)
}

export function getAllAiQuestions() {
  return read('aiQuestions', {})
}

// ---- 인쇄용 학습지 접근(세션 한정 소프트 게이트) ----
export function isPrintUnlocked() {
  return sessionStorage.getItem(PREFIX + 'printUnlocked') === '1'
}

export function unlockPrint() {
  sessionStorage.setItem(PREFIX + 'printUnlocked', '1')
}

// ---- 내보내기 / 불러오기 ----
const EXPORT_KEYS = ['apiKeys', 'aiSettings', 'progress', 'wrongNotes', 'aiQuestions']

export function exportAllData() {
  const data = {}
  for (const k of EXPORT_KEYS) data[k] = read(k, null)
  return {
    app: 'digital-logic-web',
    exportedAt: new Date().toISOString(),
    data,
  }
}

export function importAllData(payload) {
  if (!payload || typeof payload !== 'object' || !payload.data) {
    throw new Error('올바른 백업 파일이 아닙니다.')
  }
  for (const k of EXPORT_KEYS) {
    if (payload.data[k] !== undefined && payload.data[k] !== null) {
      write(k, payload.data[k])
    }
  }
}

export function clearAllData() {
  for (const k of EXPORT_KEYS) localStorage.removeItem(PREFIX + k)
}
