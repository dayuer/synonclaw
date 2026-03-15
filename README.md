# SynonClaw 官网

> **软硬一体的本地数字员工终端** — 数据不出域，算力全掌控。

SynonClaw 官方展示与销售门户网站。面向个人开发者（ToC）、企业客户（ToB）和开发者社区三类用户，承载产品展示、硬件预定、企业线索收集和开发者网络注册等核心转化目标。

🔗 **线上地址**：[https://www.synonclaw.com](https://www.synonclaw.com)

---

## 技术栈

| 层级 | 选型 |
|------|------|
| 框架 | React 19 + TypeScript |
| 构建 | Vite 6 |
| 路由 | React Router v7 |
| 样式 | Vanilla CSS（Token 驱动设计系统） |
| 测试 | Vitest + Testing Library |
| 部署 | Nginx + Let's Encrypt SSL（Debian） |

## 页面结构

| 路由 | 页面 | 用途 |
|------|------|------|
| `/` | 首页 | Hero 双产品分流 + 三列核心特性卡片 |
| `/desk` | 个人版 | 桌面硬件展示 + 8 项规格表 + 应用场景 |
| `/enterprise` | 企业版 | 机柜产品展示 + 三大特性 + 线索收集表单 |
| `/ecosystem` | 软件生态 | OpenClaw → 云兔工作流程图 + 人机协同 |
| `/developer` | 开发者网络 | 三步成长路径 + 注册 CTA |

## 项目结构

```
synonclaw/
├── public/images/          # 产品渲染图
├── src/
│   ├── components/
│   │   ├── layout/         # Navbar / Footer（全局布局）
│   │   └── shared/         # CTAButton / SectionTitle / FeatureCard（复用组件）
│   ├── pages/              # 5 个页面组件（.tsx + .css 同名配对）
│   ├── styles/
│   │   ├── tokens.css      # 设计系统 Token（色彩/字体/间距/阴影）
│   │   ├── reset.css       # CSS Reset
│   │   └── global.css      # 全局样式 + 动画 Keyframes
│   ├── hooks.tsx            # ScrollReveal / useFormValidation 自定义 Hook
│   ├── App.tsx             # 路由配置
│   └── main.tsx            # 入口
├── docs/
│   ├── contracts/          # 组件接口契约（components.json）
│   └── tech_design/        # 技术设计文档
├── team/                   # 需求 / 验收标准 / 交接单
├── vite.config.ts
├── tsconfig.json
└── package.json
```

## 设计系统

基于 CSS Custom Properties 的 Token 体系，统一管理：

- **色彩**：深色主题（`#0a0a0f` 基底），青蓝 `#00d4ff` + 翠绿 `#00ff88` 双强调色
- **字号**：`clamp()` 流式缩放，8 级层次（hero → xs）
- **间距**：9 级间距梯度（xs → 5xl）
- **动画**：`fadeIn` / `fadeInUp` / `pulse` / `glowPulse` / `flowLine`

## 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器（端口 3000）
npm run dev

# TypeScript 检查 + 生产构建
npm run build

# 运行测试
npm test
```

## 部署

服务器架构：Nginx（stream SNI 分流）→ 8443 端口 SSL 终止 → 静态文件服务。

```bash
# 服务器上拉取并构建
ssh root@<SERVER_IP>
cd /var/www/www.synonclaw.com
git pull origin main
npm run build
```

生产构建输出到 `dist/`，Nginx 直接指向该目录，SPA 回退由 `try_files` 处理。

## 许可

© 2026 SynonClaw. All rights reserved.
