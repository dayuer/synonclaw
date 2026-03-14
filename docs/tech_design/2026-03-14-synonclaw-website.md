# SynonClaw 官网 — 技术文档

> 创建时间：2026-03-14

## 技术栈

| 项 | 选择 | 版本 |
|---|------|------|
| 构建工具 | Vite | 6.4.1 |
| UI 框架 | React | 19.x |
| 路由 | React Router | 7.x |
| 语言 | TypeScript | 5.7 |
| 样式 | 原生 CSS + CSS Variables | — |
| 字体 | Inter (Google Fonts) | — |

## 项目结构

```
src/
├── components/
│   ├── layout/       Navbar, Footer
│   └── shared/       CTAButton, SectionTitle, FeatureCard
├── pages/            HomePage, DeskPage, EnterprisePage, EcosystemPage, DeveloperPage
├── styles/
│   ├── tokens.css    设计Token（色彩/字体/间距/阴影/动画）
│   ├── reset.css     CSS Reset
│   └── global.css    全局样式 + 动画关键帧
├── hooks.tsx          ScrollReveal + 表单验证
├── App.tsx            路由配置
└── main.tsx           入口
```

## 设计系统

- **主背景**: `#0a0a0f` / **辅背景**: `#12121a` / **卡片**: `#1a1a2e`
- **强调色**: `#00d4ff`（光纤蓝）/ `#00ff88`（电平绿）
- **字体**: Inter, clamp() 响应式字号

## 构建产物

- CSS: 26.44 KB (gzip 4.80 KB)
- JS: 259.16 KB (gzip 81.76 KB)
- 总 gzip: ~86 KB
