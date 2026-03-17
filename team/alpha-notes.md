# Alpha Notes — SynonClaw 官网重新定义

## 技术决策

1. **Canvas 网络动画** — 首页 Hero 使用 Canvas 实现粒子连线动画（40 节点 + 距离判定连线），轻量且视觉冲击。
2. **rAF 数字动画** — 社会证明区数字基于 IntersectionObserver 触发 + requestAnimationFrame easeOut 动画。
3. **路由重定向** — `/desk` 和 `/enterprise` 使用 `<Navigate replace>` 301 重定向至 `/products`，保护旧链接。
4. **BEM CSS** — 每页独立 CSS，延续项目现有 BEM 命名 + design token 体系。

## 用户反馈修正

- 三支柱从技术能力（安全网络/AI引擎/低代码）调整为核心价值（**安全/可管控/统一知识库**）
- AI 引擎定位从"纯本地"调整为**本地+云混合架构**（本地优先保安全，云端弹性降成本提可用性）
- 所有页面去除内部技术栈名称（GNB/ARC4/XOR/OpenClaw/云兔）

## 测试结果

- `npx tsc --noEmit` → 零错误
- `npm test` → 78/78 全绿
- 浏览器 5 页面全部渲染验证通过

## Beta TODO

- 响应式断点验证（320px / 768px / 1440px）
- 旧页面文件清理（DeskPage.tsx + DeskPage.css + EnterprisePage.tsx + EnterprisePage.css）
- Footer 社交链接真实 URL 补充
