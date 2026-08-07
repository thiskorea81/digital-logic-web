// 정적 데이터 로더: data/materials, data/questions 아래 모든 JSON을 빌드 시점에 번들에 포함시킨다.
const materialModules = import.meta.glob('./materials/*.json', { eager: true })
const questionModules = import.meta.glob('./questions/*.json', { eager: true })

const materials = Object.values(materialModules).map((m) => m.default ?? m)

const questionsByStandard = new Map()
for (const mod of Object.values(questionModules)) {
  const list = mod.default ?? mod
  for (const q of list) {
    if (!questionsByStandard.has(q.standard_id)) questionsByStandard.set(q.standard_id, [])
    questionsByStandard.get(q.standard_id).push(q)
  }
}

// standard_id 예: "디논 08-01" -> 정렬 키 "0801"
function sortKey(standardId) {
  return standardId.replace(/[^0-9]/g, '')
}

materials.sort((a, b) => sortKey(a.standard_id).localeCompare(sortKey(b.standard_id)))

// 단원명(예: "8. 디지털 논리 회로의 응용") 순서대로 성취기준을 묶는다.
export const units = (() => {
  const byUnit = new Map()
  for (const m of materials) {
    if (!byUnit.has(m.단원)) byUnit.set(m.단원, [])
    byUnit.get(m.단원).push(m)
  }
  return Array.from(byUnit.entries())
    .map(([단원, standards]) => ({ 단원, standards }))
    .sort((a, b) => {
      const na = parseInt(a.단원.match(/^\d+/)?.[0] ?? '0', 10)
      const nb = parseInt(b.단원.match(/^\d+/)?.[0] ?? '0', 10)
      return na - nb
    })
})()

const materialsById = new Map(materials.map((m) => [m.standard_id, m]))

export function getMaterial(standardId) {
  return materialsById.get(standardId) ?? null
}

export function getQuestions(standardId) {
  return questionsByStandard.get(standardId) ?? []
}

export function allMaterialsFlat() {
  return materials
}
