# 디지털논리회로 학습노트

고등학교 '디지털논리회로' 과목의 학습자료와 자가 진단(객관식) 문제를 정리한 프런트엔드 전용 정적 웹사이트입니다.

- Vue 3 + Vite, 백엔드 없이 정적 파일만으로 동작합니다.
- 학습자료(`src/data/materials`)와 문제(`src/data/questions`)는 원 교과서 문장을 그대로 옮기지 않고 재구성한 자료입니다.
- 회로도 등 이미지는 모두 SVG로 직접 제작했습니다.

## 개발

```bash
npm install
npm run dev
```

## 빌드

```bash
npm run build
```

`dist/` 폴더가 생성되며, Netlify 등 정적 호스팅에 그대로 배포할 수 있습니다.
