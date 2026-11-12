<script setup>
// 문항 표시: O(마지막으로 맞힘) · X(마지막으로 틀림) · ?(헷갈림) · 점선(아직 안 풂)
defineProps({ mark: { type: String, default: '' } })
const TITLE = { o: '맞힘(마지막으로 푼 결과)', x: '틀림(마지막으로 푼 결과)', '?': '헷갈림 표시한 문제' }
</script>

<template>
  <span class="mark" :class="mark === '?' ? 'q' : mark || 'none'" :title="TITLE[mark] || '아직 안 풀었어요'">
    {{ mark === 'o' ? 'O' : mark === 'x' ? 'X' : mark === '?' ? '?' : '' }}
  </span>
</template>

<style scoped>
.mark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  flex: none;
  border-radius: 50%;
  border: 1.5px solid var(--border);
  font-size: 13px;
  font-weight: 800;
  line-height: 1;
}
.mark.o {
  color: var(--ok);
  border-color: var(--ok);
  background: color-mix(in srgb, var(--ok) 12%, transparent);
}
.mark.x {
  color: var(--bad);
  border-color: var(--bad);
  background: color-mix(in srgb, var(--bad) 12%, transparent);
}
.mark.q {
  color: #b45309;
  border-color: #f59e0b;
  background: rgba(245, 158, 11, 0.14);
}
@media (prefers-color-scheme: dark) {
  .mark.q {
    color: #fcd34d;
  }
}
.mark.none {
  border-style: dashed;
}
</style>
