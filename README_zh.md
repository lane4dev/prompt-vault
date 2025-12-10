# Prompt Vault

[English](./README.md) | **中文**

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Version](https://img.shields.io/badge/version-0.1.0-green.svg)
![Electron](https://img.shields.io/badge/Electron-39.0+-orange.svg)
![React](https://img.shields.io/badge/React-19.0-blue.svg)

**Prompt Vault** 是一款专为提示词工程师（Prompt Engineers）和 LLM 开发者设计的本地优先、注重隐私的应用程序，旨在系统化地管理、版本控制和优化您的提示词库。

本项目完全使用 **Gemini CLI** 并遵循 **Vibe Coding** 理念构建，是“Agentic Coding”（智能体辅助编程）的一个实践范例——即由人类意图指导 AI 执行以构建高质量软件。

核心设计深受 **Lee Boonstra** 的 [Prompt Engineering](https://www.gptaiflow.com/assets/files/2025-01-18-pdf-1-TechAI-Goolge-whitepaper_Prompt%20Engineering_v4-af36dcc7a49bb7269a58b1c9b89a8ae1.pdf) 白皮书中 **"Document the various prompt attempts"（记录各种提示词尝试）** 方法论的启发。具体来说，它将 *Table 21: A template for documenting prompts* 中描述的工作流数字化，解决了以下关键需求：

![tb-21](./docs/images/tb-21.png)


*   **迭代追踪：** 保留提示词版本的完整记录，以便对比哪些有效、哪些无效。
*   **元数据捕获：** 存储极大地影响输出结果的关键参数（如 Temperature, Top-P, Model Version）。
*   **调试与优化：** 在提示词文本旁维护“目标（Goal）”和“输出样本（Output Samples）”，以验证其随时间变化的表现。

Prompt Vault 不再依赖静态的电子表格，而是提供了一个专门的、受版本控制的环境，用工程化的严谨态度来对待您的提示词。

![应用主界面占位图](./docs/images/main-interface.png)
*(主界面截图，展示提示词列表和详情视图)*

## ✨ 功能特性

- **🏠 本地优先 & 隐私专注**：您的提示词存储在本地机器上（SQLite）。
- **📚 有序仓库**：通过文件夹、标签和强大的过滤功能管理您的提示词。
- **🔀 版本控制**：像对待代码一样对待提示词。为单个提示词实体维护多个版本（v1, v2, v3...），以追踪迭代和改进。
- **⚙️ 详细元数据**：在文本旁存储关键执行参数：
    - 模型（例如 GPT-4o, Claude 3.5 Sonnet, DeepSeek）
    - Temperature, Top-P, Token 限制
    - 目标 & 预期输出样本
- **🎨 现代 UI**：基于 React, Tailwind CSS 和 shadcn/ui 构建，提供整洁、支持深色模式的界面。
- **🛠️ 模型管理**：配置自定义的本地或远程模型及其特定的上下文窗口设置。

## 📸 截图

### 提示词编辑器 & 版本管理
![提示词编辑器占位图](./docs/images/history-view.png)
*(带有参数配置的富文本/Markdown 编辑器)*

### 设置 & 模型配置
![设置视图占位图](./docs/images/settings-view.png)
*(管理可用模型和全局应用设置)*

## 🛠 技术栈

- **核心**: [Electron](https://www.electronjs.org/), [React](https://react.dev/), [TypeScript](https://www.typescriptlang.org/)
- **构建系统**: [Electron Vite](https://electron-vite.org/)
- **UI 框架**: [Tailwind CSS](https://tailwindcss.com/) v4, [shadcn/ui](https://ui.shadcn.com/)
- **状态管理**: [Zustand](https://github.com/pmndrs/zustand)
- **数据库**: [Better-SQLite3](https://github.com/WiseLibs/better-sqlite3) 搭配 [Drizzle ORM](https://orm.drizzle.team/)

## 📥 下载

对于最终用户，获取 Prompt Vault 最简单的方法是从 [GitHub Releases 页面](https://github.com/lane4dev/prompt-vault/releases) 下载最新预构建的安装包。

可用安装包：
-   **macOS**: `.dmg` 或 `.zip`
-   **Windows**: `Setup.exe` 或 `portable.exe` 或 `.zip`
-   **Linux**: `.AppImage`, `.deb`, `.rpm`

## 💻 开发者指南

如果您想贡献代码、从源代码构建或自定义应用程序，请遵循以下步骤：

### 前置要求

- [Node.js](https://nodejs.org/) (推荐 v22 或更高版本)
- [pnpm](https://pnpm.io/) (本项目使用 `pnpm` 进行包管理)

### 1. 克隆仓库
   ```bash
   git clone https://github.com/lane4dev/prompt-vault.git
   cd prompt-vault
   ```

### 2. 安装依赖
   ```bash
   pnpm install
   ```

### 3. 初始化数据库
   应用程序会在首次运行时自动设置本地 SQLite 数据库。

### 4. 开发

以开发模式启动应用（支持热重载）：

```bash
pnpm dev
```

### 5. 构建

构建生产环境应用（创建安装程序/可执行文件）：

```bash
pnpm build
```

## 🗺️ 开发计划 (Roadmap)

- [ ] 按标签过滤
- [X] Output Samples 支持 Markdown 预览
- [ ] Prompt 批量导入导出
- [ ] 同步到网盘 (WebDAV, Google Drive 等)
- ~~接入大模型，自动优化提示词~~

## 🤝 贡献

欢迎贡献代码！请随意提交 Pull Request。

1. Fork 本项目
2. 创建您的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交您的更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目基于 MIT 许可证开源 - 详情请参阅 [package.json](package.json) 文件。

---

*注意：本项目目前处于活跃的 Alpha 开发阶段。数据结构和功能可能会发生变化。*
