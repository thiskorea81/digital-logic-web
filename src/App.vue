<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
// 위쪽 메뉴: 학습자료 · 평가 · 오답노트
const section = computed(() =>
  ['quiz-home', 'quiz', 'question'].includes(route.name) ? 'quiz' : route.name === 'wrong' ? 'wrong' : 'materials'
)
</script>

<template>
  <header class="site-header">
    <RouterLink to="/" class="brand">디지털논리회로 학습노트</RouterLink>
    <nav class="main-nav">
      <RouterLink to="/" :class="{ on: section === 'materials' }">학습자료</RouterLink>
      <RouterLink :to="{ name: 'quiz-home' }" :class="{ on: section === 'quiz' }">평가</RouterLink>
      <RouterLink :to="{ name: 'wrong' }" :class="{ on: section === 'wrong' }">오답노트</RouterLink>
    </nav>
  </header>
  <main class="site-main">
    <RouterView />
  </main>
  <footer class="site-footer">
    <p>비상업적 학습 목적의 개인 제작 자료입니다. 원 교과서의 문장을 그대로 옮기지 않고 재구성했습니다.</p>
  </footer>
</template>

<style>
:root {
  --bg: #ffffff;
  --bg-soft: #f7f7f9;
  --text: #1f2328;
  --text-dim: #6b7280;
  --border: #e4e4e7;
  --accent: #4f46e5;
  --accent-bg: #eef0fb;
  --accent-border: #c7ccf5;
  --code-bg: #f4f3ec;
  --ok: #4caf7d;
  --bad: #e5566e;
}

@media (prefers-color-scheme: dark) {
  :root {
    --bg: #16171b;
    --bg-soft: #1d1f24;
    --text: #e7e8ea;
    --text-dim: #9aa0aa;
    --border: #2c2f36;
    --accent: #8b85f5;
    --accent-bg: #232244;
    --accent-border: #3c3a6e;
    --code-bg: #1c1d22;
  }
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  background: var(--bg);
  color: var(--text);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Pretendard', 'Noto Sans KR', sans-serif;
}

a {
  color: inherit;
}

.site-header {
  display: flex;
  align-items: baseline;
  gap: 12px;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border);
  flex-wrap: wrap;
}

.brand {
  font-size: 18px;
  font-weight: 700;
  text-decoration: none;
  color: var(--text);
}

.main-nav {
  display: flex;
  gap: 4px;
  align-self: center;
}

.main-nav a {
  padding: 6px 12px;
  border-radius: 999px;
  color: var(--text-dim);
  text-decoration: none;
  font-size: 14px;
  font-weight: 600;
}

.main-nav a:hover {
  color: var(--accent);
}

.main-nav a.on {
  color: var(--accent);
  background: var(--accent-bg);
}

.site-main {
  max-width: 780px;
  margin: 0 auto;
  padding: 24px 20px 60px;
}

.site-footer {
  max-width: 780px;
  margin: 0 auto;
  padding: 20px;
  color: var(--text-dim);
  font-size: 12px;
  border-top: 1px solid var(--border);
}
</style>
