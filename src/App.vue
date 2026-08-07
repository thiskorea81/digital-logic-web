<script setup>
</script>

<template>
  <header class="site-header">
    <RouterLink to="/" class="brand">디지털논리회로 학습노트</RouterLink>
    <span class="tagline">학습자료 &amp; 자가 진단 문제</span>
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

.tagline {
  font-size: 13px;
  color: var(--text-dim);
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
