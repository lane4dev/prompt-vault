# 项目背景（Project Context）

你现在所在的仓库是基于模板：
- https://github.com/daltonmenezes/electron-app

技术栈大致为：
- Electron（主进程 + preload）
- React 18/19（renderer）
- Tailwind CSS + shadcn/ui 作为组件库
- Electron Vite / 打包脚本等已经配置好

## 项目结构：

### src/lib

A folder containing lib configurations/instances.

### src/main

A folder containing the main process files and folders.

### src/renderer

A folder containing the renderer process files and folders. ReactJS lives here!

### src/preload
A folder containing the preload script that expose the API connection between main and renderer world by IPC in the context bridge.

### src/resources

A folder containing public assets and assets for the build process like icons.

> **Note**: all the content inside the **public** folder will be copied to the builded version as its.

### src/shared

A folder containing data shared between one or more processes, such as constants, utilities, types, etc.

## 目录结构

```
src
├── lib
│   ├── electron-app
│   │   ├── extensions
│   │   │   └── react-developer-tools
│   │   │       ├── build
│   │   │       │   ├── backendManager.js
│   │   │       │   ├── background.js
│   │   │       │   ├── fileFetcher.js
│   │   │       │   ├── hookSettingsInjector.js
│   │   │       │   ├── importFile.worker.worker.js
│   │   │       │   ├── installHook.js
│   │   │       │   ├── installHook.js.map
│   │   │       │   ├── main.js
│   │   │       │   ├── panel.js
│   │   │       │   ├── parseSourceAndMetadata.worker.worker.js
│   │   │       │   ├── prepareInjection.js
│   │   │       │   ├── proxy.js
│   │   │       │   ├── react_devtools_backend_compact.js
│   │   │       │   └── react_devtools_backend_compact.js.map
│   │   │       ├── icons
│   │   │       │   ├── 128-deadcode.png
│   │   │       │   ├── 128-development.png
│   │   │       │   ├── production.svg
│   │   │       │   └── restricted.svg
│   │   │       ├── main.html
│   │   │       ├── manifest.json
│   │   │       ├── panel.html
│   │   │       └── popups
│   │   │           ├── deadcode.html
│   │   │           ├── development.html
│   │   │           ├── disabled.html
│   │   │           ├── outdated.html
│   │   │           ├── production.html
│   │   │           ├── restricted.html
│   │   │           ├── shared.css
│   │   │           ├── shared.js
│   │   │           └── unminified.html
│   │   ├── factories
│   │   │   ├── app
│   │   │   │   ├── instance.ts
│   │   │   │   └── setup.ts
│   │   │   ├── ipcs
│   │   │   │   └── register-window-creation.ts
│   │   │   └── windows
│   │   │       └── create.ts
│   │   ├── release
│   │   │   ├── constants
│   │   │   │   └── colors.ts
│   │   │   ├── modules
│   │   │   │   ├── prebuild.ts
│   │   │   │   └── release.ts
│   │   │   └── utils
│   │   │       ├── exec.ts
│   │   │       ├── extractors.ts
│   │   │       ├── path.ts
│   │   │       ├── question.ts
│   │   │       └── validations.ts
│   │   └── utils
│   │       ├── ignore-console-warnings.ts
│   │       ├── index.ts
│   │       └── react-devtools.ts
│   └── electron-router-dom.ts
├── main
│   ├── index.ts
│   └── windows
│       └── main.ts
├── preload
│   └── index.ts
├── renderer
│   ├── components
│   │   └── ui
│   │       └── alert.tsx
│   ├── globals.css
│   ├── index.html
│   ├── index.tsx
│   ├── lib
│   │   └── utils.ts
│   ├── routes.tsx
│   └── screens
│       └── main.tsx
├── resources
│   ├── build
│   │   └── icons
│   │       ├── icon.icns
│   │       └── icon.ico
│   └── public
│       └── illustration.svg
└── shared
    ├── constants.ts
    ├── types.ts
    └── utils.ts
```

## 数据迁移

以后当您需要修改数据库结构时（例如新增字段、新建表），请严格按照以下步骤操作，不要手动修改数据库或 SQL：

   1. 修改 Schema:
       * 在 src/shared/db/schema.ts 中修改 TypeScript 定义（例如添加 category 字段）。

   2. 生成迁移文件:
       * 在终端运行：npx drizzle-kit generate
       * Drizzle 会自动对比您的 schema 变更，并在 drizzle/ 目录下生成一个新的编号 SQL 文件（例如 0001_add_category.sql）。

   3. 提交与发布:
       * 将新生成的 .sql 文件随代码一起提交到 Git。
       * 用户安装新版本应用后，启动时会自动检测到这个新文件，并安全地应用变更，原有数据完全保留。

---

# 我的目标：

在这个模板基础上，开发一款 **本地 Prompt 管理应用**，用于管理大模型提示词及其版本。

应用的核心特性包括：

1. **Prompt 仓库 + 列表视图**
   - 左侧是 Prompt 列表（可以按标签/文件夹/模型过滤）。
   - 每条记录对应一个「Prompt 逻辑实体」，内部有多个「版本」。

2. **Prompt 详情 + 版本管理**
   - 右侧是详情区域：
     - 顶部：Prompt 名称（可编辑）、版本切换（v1、v2、v3…）。
     - 中部：参数表单（Goal / Model / Temperature / Token Limit / Top-K / Top-P）。
     - 底部：Prompt 主体（Markdown 编辑器）和 Output 示例（Markdown 预览或只读编辑器）。

3. **记录字段（来自 Lee Boonstra 的 Prompt Engineering 表格）**
   每个 Prompt 版本至少包含这些字段：

   - `name`：name and version of your prompt
   - `goal`：One sentence explanation of the goal of this attempt
   - `model`：name and version of the used model
   - `temperature`：value between 0–1
   - `tokenLimit`：Token Limit
   - `topK`：Top-K
   - `topP`：Top-P
   - `prompt`：Write all the full prompt（Markdown 文本）
   - `outputSamples`：Write out the output or multiple outputs（Markdown）

4. **UI 结构**
   - 顶部：简单的 App Header（应用名、设置入口、全局搜索等）。
   - 主体区域：水平分栏布局
     - 左侧：PromptSidebar（列表 + 搜索 + 筛选 + 新建按钮）。
     - 右侧：PromptDetailPane（元信息表单 + Markdown 编辑器 + 版本管理）。
   - 所有 UI 尽量基于 shadcn/ui 现有组件（Button、Input、Select、Tabs、Resizable、Dialog、Form 等）。

5. **存储策略（初版）**
   - 本地优先（local-first）。
   - 可以先用 JSON 文件存储 Prompt 列表和版本信息（通过 Electron 主进程读写）。
   - 后续可以升级为 SQLite / Git 仓库等，但请优先保持结构清晰，便于迁移。

---

# 你的角色（Your Role）

你是一个：
- 熟悉 Electron + React + TypeScript + Tailwind + shadcn/ui 的全栈工程师，
- 也熟悉 Prompt Engineering 和 VS Code / Obsidian / PromptHub 这类工具的交互设计，
- 会通过 Gemini CLI 的「agentic coding」能力，在本地项目中创建/修改文件，辅助我完成开发。

**要求你：**
- 任何时候都要考虑这个项目的长期可维护性。
- 避免一次性大改大量文件；保持改动原子、逻辑清晰。
- 尽量使用项目已有的工具链和风格（如已使用 TypeScript，就继续使用 TS；已使用 shadcn 的 Button，就不要自己手撸 Button）。

默认回答语言：**中文**（除非代码注释或变量名需要英文）。

---

# 工作方式（Workflow Rules）

当我在这个仓库目录里用 Gemini CLI 向你提出需求时，请按照如下流程执行：

1. **先制定计划（Plan First, No Edits Yet）**
   - 第一步永远是阅读代码结构，理解当前状态，然后输出一个「计划」。
   - 以 Markdown 格式输出一个 `## Plan` 小节，其中包含：
     - 要实现的目标简述；
     - 将要创建/修改/删除的文件列表；
     - 每一步的简要说明（例如“在 src/renderer/features/prompts 下新建 PromptAppShell”等）。
   - 在这个阶段 **不要改动任何文件**。

2. **等待我确认**
   - 输出计划后，以一句简单话语结尾，例如：
     > “请确认上面的计划（输入 OK 或指出需要修改的地方），我再开始修改代码。”
   - 等我明确输入 “OK” 或类似确认后，再进行下一步。

3. **按步骤修改代码（Small, Reviewable Changes）**
   - 修改时，遵循计划，分批完成：
     - 每一批次只处理少量文件，便于我 review。
     - 每一批开始前简要说明这一步要做什么。
   - 使用清晰的 Markdown 结构输出：
     - `### Step N: ...`
     - 每个修改文件对应一个小节，给出完整的最终版本代码（必要时可以省略无关部分，但要说明用 `// ...` 省略）。

4. **保持与项目结构兼容**
   - 不要破坏 Electron 主进程 / preload 现有配置（除非这是任务的一部分）。
   - 他人模板中的公共工具（如 `bridge`、`hooks`、`lib`）应尽量复用，而不是全部重写。
   - 路由如果已经存在，请在现有路由上添加 `PromptManager` Screen，而不是完全删掉原有页面，除非我明确要求。

5. **关于文件 & 存储**
   - 如果需要新增本地持久化，请：
     - 优先通过 main + preload 暴露安全 API，而不是直接在 renderer 使用 Node.js API。
     - 使用合适的存储库（例如 electron-store / fs + JSON），并说明数据结构。
   - 所有新增的类型（PromptRecord / PromptVersion 等）统一放在 `src/renderer/features/prompts/domain/` 或类似位置，方便集中管理。

6. **关于 UI & 组件**
   - 所有面向用户的 UI 组件：
     - 尽量用 shadcn/ui 提供的 Button、Input、Select、Tabs、Card、Dialog、Form、Resizable 等组件组合。
     - 风格统一接近 shadcn 设计，而不是混用其他 UI 库。
   - Prompt 编辑器部分：
     - 可以先用简单的 `<textarea>` + Markdown 预览实现；
     - 或者集成像 `@uiw/react-md-editor` 这样的 Markdown 编辑器；
     - 后续如果要改成 Tiptap / Milkdown，再单独拆 `<PromptEditorCore>` 组件。

7. **解释与文档**
   - 每次完成一批修改后，请简要说明：
     - 新增/修改了哪些组件；
     - 对数据流（状态管理）的影响；
     - 如何在项目中运行/测试这部分功能（例如 `pnpm dev`，点击哪一个入口可以看到效果）。
   - 如有必要，帮我更新或新建一个简单的 `docs/prompt-manager.md` 文档，记录关键设计。

---

# 项目进度日志（Project Status Log）

## 2025-11-29 (Initial Development)
- **UI 框架搭建**:
  - 创建了 `PromptManagerScreen` 作为主容器，采用左右分栏布局（Sidebar + DetailPane）。
  - 集成了 `shadcn/ui` 的基础组件（Button, Input, Resizable, etc.）。
- **Prompt 列表 (Sidebar)**:
  - 实现了 Prompt 列表展示，支持选中切换。
  - 实现了「新建 Prompt」功能，支持输入标题、Goal 和 **多选标签**（使用 Popover + Command）。
  - 实现了「删除 Prompt」功能（含确认对话框）。
  - 标签展示优化：列表中最多显示 3 个标签，超出显示 "+N"。
- **Prompt 详情 (DetailPane)**:
  - 实现了 Prompt 元数据编辑（Goal, Model, Params）。
  - 实现了 **版本管理** UI：Tabs 切换版本，支持新建、重命名、删除版本。
  - 实现了 **标签管理**：
    - Header 区域展示完整标签列表。
    - 支持点击 "Edit Tags" 按钮弹出 Popover 进行标签的增删（与 Sidebar 新建时的组件逻辑一致）。
    - 状态实时同步到父组件 `PromptManagerScreen`。
  - 实现了 **Prompt 编辑器** 和 **Output 示例** 管理（支持多样本切换）。
- **数据流**:
  - 状态提升（Lifted State）：`prompts` 和 `selectedPromptId` 状态管理在 `PromptManagerScreen`。
  - 通过 Props (`onUpdatePromptTags` 等) 将子组件变更传递回顶层。

## 2025-11-30 (近期开发)
  - **数据管理与持久化**:
    - 实现了基本的 CRUD 操作和 Drizzle 数据库 Schema 定义。
    - 优化了 `UPDATE_PROMPT` 的 Drizzle 类型处理，并修正了默认内容逻辑。
    - **Prompt Mode 持久化**: 在 `prompts` 表中添加 `currentMode` 字段（TEXT, default 'api'），在 `promptVersions` 表中添加 `mode` 字段（TEXT, default 'api'）。用户切换 Mode 会即时更新 `prompts.currentMode`，点击 "Save" 时会将当前的 Mode 写入 `prompt_versions.mode`。
- **版本控制与保存机制**:  - 实现了版本管理功能（'Draft' vs 'Snapshot'）。
  - 改进了 'Save' 逻辑，通过归档当前主要版本并创建新版本来避免重复的 Tab 条目。
  - 实现了 'Save' 按钮在无实质性内容或参数更改时自动禁用。
  - 实现了版本回溯功能，允许用户从历史记录中恢复到任意版本。
- **侧边栏排序与时间戳**:
  - 通过精细控制 `lastModified` 字段的更新（仅在元数据修改或主要版本保存时更新），确保侧边栏排序的稳定性。
- **模型管理**:
  - 在设置中实现了完整的模型管理系统（添加、激活/停用、删除）。
  - '删除模型' 功能实现了软删除，以维护数据完整性。
  - Prompt 详情中的模型选择下拉菜单现在只显示活跃模型，但会保留显示非活跃的当前选中模型。
- **主题与设置**:
  - 实现了全局主题选择功能（亮色、暗色、系统）。
  - 改进了设置对话框的尺寸和响应性。
  - 重新设计了模型管理 UI。
- **UI 优化**:
  - 修复了 `PromptSidebar` 和 `PromptDetailPane` 之间的 UI 分隔线对齐问题。
  - 修复了 `PromptDetailPane.tsx` 中 `AlertDialogTitle` 和 `DialogTitle` 的 JSX 语法错误。

## 2025-12-01 (Bug Fixes & Refinements)
- **版本管理逻辑修复**:
  - **版本删除**: 修复了删除主版本后，关联的 Snapshot（历史记录）未被删除导致 "Zombie History" 的问题。现在后端 `DELETE_PROMPT_VERSION` 会级联删除所有同 `label` 的版本。
  - **版本创建**: 修复了新建版本时 `label` 可能重复的问题。现在完全依赖后端的单调递增 `versionNumber` 逻辑来生成唯一的默认 `label`。
  - **内容同步 (Draft Sync)**: 修复了删除版本后，Prompt 详情页内容未更新（仍显示已删除版本内容）的 Bug。通过在前端删除后显式调用 `updatePrompt` 强制同步 Draft 状态。
  - **UI/UX 改进**:
    - **删除按钮样式**: 修复了亮色模式下删除按钮样式问题，正确实现了 `variant="destructive"`。
    - **Save 按钮状态**: 优化了 "Save" 按钮的可用状态逻辑。现在 `isModified` 会将当前 Draft 内容与 **当前选中的版本** 进行比对，而不是强制比对最新的 Major 版本。这解决了查看旧版本时 "Save" 按钮错误亮起的问题。
    - **Output Samples 消失修复**: 重构了 `PromptDetailPane`，移除了多余的本地状态 (`versions`, `samples`)，改为直接从 Store 的 `selectedPromptDetail` 派生数据。这修复了编辑 Prompt 文本时因状态竞态导致 Output Samples 意外清空的严重 Bug。
    - **Output Samples 编辑功能**: 实现了 Output Samples 的编辑和删除功能。通过打通 IPC 通道 (`UPDATE_OUTPUT_SAMPLE`, `DELETE_OUTPUT_SAMPLE`) 和 Zustand Store 的 Optimistic Update，现在用户可以对样本进行增删改查并持久化保存。
    - **Preload Script Fix**: 在 `src/preload/index.ts` 中暴露了 `updateOutputSample` 和 `deleteOutputSample` 方法到渲染进程，解决了 `window.promptApi.updateOutputSample is not a function` 的错误。
    - **文本框滚动条**: 为 Prompt 编辑器和 Output Samples 的 `Textarea` 组件添加了 `overflow-y-auto` 类，确保当内容超出可见区域时，会自动出现垂直滚动条，提升长文本的可用性。
    - **Layout Refactor**: 重构了 `PromptDetailPane` 的 Flex 布局。移除了主区域的全局滚动，改为让编辑器区域 (`flex-1`) 自动填充剩余垂直空间。
    - **Flexbox 溢出修复**: 为嵌套在 Flex/Grid 布局中的编辑器容器和 `Textarea` 组件添加了 `min-h-0`。这解决了 Flex item 默认不会收缩小于其内容高度的问题，确保了 `overflow-y-auto` 能够生效并显示内部滚动条，防止长文本撑破布局。
    - **快捷键支持**: 添加了 `Ctrl-S` (Windows/Linux) 和 `Cmd-S` (macOS) 快捷键，允许用户快速触发保存操作 (仅当有未保存修改时生效)，并修复了 `ReferenceError`，确保 `useEffect` 在所有相关处理函数定义之后调用。
    - **窗口状态持久化**: 实现了窗口大小和位置的自动保存与恢复。
      - 新增 `src/main/windowState.ts` 模块处理本地 JSON 存储。
      - 在主窗口关闭前保存当前位置和大小，启动时自动恢复。
      - 设置了窗口最小尺寸限制 (`minWidth: 1000`, `minHeight: 600`) 以保证 UI 布局完整性。

## 2025-12-04 (Bug Fixes & Refinements)
- **版本管理逻辑修复**:
    - **JSX 语法修复**: 修复了 `PromptDetailPane.tsx` 中 `onValueChange` 属性中内联函数定义导致的 JSX 语法错误，将 `handlePromptModeChange` 函数提取到组件主体中。
    - **ReferenceError 修复**: 修复了 `PromptDetailPane.tsx` 中 `selectedVersion` 未定义的 `ReferenceError`，将其替换为正确的 `activeVersion`。
    - **初始化顺序修复**: 修复了 `PromptDetailPane.tsx` 中 `promptMode` 引用 `activeVersion` 导致的 `ReferenceError`，将 `promptMode` 的定义移动到 `activeVersion` 之后。
    - **循环依赖修复**: 修复了 `PromptDetailPane.tsx` 中 `promptMode` 与 `isTokenLimitExceedingContext` 之间循环引用导致的 `ReferenceError`，调整了代码块的定义顺序。
- **架构升级**:  - **数据库迁移**: 引入了 Drizzle Migrations 机制。现在应用启动时会自动检查并执行 `drizzle/` 目录下的 SQL 迁移文件，替代了之前的硬编码 `initSchema`。这确保了未来版本更新时数据库结构的平滑过渡和数据安全。
  - **打包配置**: 更新了 `electron-builder` 配置，将 `drizzle` 文件夹作为 `extraResources` 打包，确保生产环境中迁移文件可用。
      - **迁移执行修复**: 修复了数据库迁移未执行的 Bug，通过在主进程入口文件 `src/main/index.ts` 中引入 `src/main/db/index.ts`，确保应用启动时正确运行数据库迁移。
      - **Migration SQL 修复**: 修复了 Drizzle 生成的 `0002_lazy_callisto.sql` 迁移文件中的 SQL 错误。原自动生成的 SQL 尝试从旧表中 SELECT 不存在的 `current_mode` 字段，导致迁移失败。手动将其修改为 SQLite 支持的 `ALTER TABLE ... ADD COLUMN` 语句。
  
      - **Prompt Mode 显示修复**: 修复了 `PromptDetailPane.tsx` 中 Prompt Mode `Select` 组件显示为空的问题，通过为其添加 `value={promptMode}` 属性，使其成为受控组件并正确显示当前选定的 Mode。

    - **Prompt Mode 切换修复**: 修复了 `PromptDetailPane.tsx` 中 Prompt Mode 切换无效的问题。
      - 修正了 `promptMode` 变量的定义，使其正确反映 Draft 状态 (`promptDetail.currentMode`)。
      - 在 `handleVersionTabChange` 函数中，添加了将当前版本 Mode 更新到 Draft 状态 (`currentMode`) 的逻辑。
      - 更新了 `src/shared/ipc-types.ts` 和 `src/renderer/features/prompts/domain/models.ts` 中的类型定义，包含了 `currentMode` 字段。

    - **IPC 参数错位修复**: 修复了 `createPromptVersion` 调用链中因漏传 `mode` 参数导致的所有后续参数错位（如 `isMajorVersion` boolean 被传给了 `note` string）的问题。
      - 更新了 `src/renderer/features/prompts/domain/models.ts`、`PromptService.ts`、`src/preload/index.ts` 和 `src/shared/ipc-types.ts`，确保 `mode` 参数在所有层级都被正确传递。

    - **Revert Mode 修复**: 修复了历史记录侧边栏 Revert 功能未重置 Prompt Mode 的问题。
      - 在 `PromptDetailPane.tsx` 的 `handleRevertConfirm` 函数中，添加了将 `versionToRevert.mode` 同步到 `updatePrompt` 的 `currentMode` 字段的逻辑，确保 Mode 随版本回溯而更新。


    - **Output Markdown 预览**: 在 `PromptDetailPane.tsx` 中集成了 `@uiw/react-markdown-preview`。现在 Output Samples 在 Preview 模式下会渲染为 Markdown，提升了阅读体验。
    - **Markdown 预览主题适配**: 实现了 `MarkdownPreview` 组件的主题自动切换。通过 `MutationObserver` 监听 `html` 标签的 class 变化（检测 dark 模式），动态设置 `data-color-mode`，确保预览样式与应用主题保持一致。
    - **Import 恢复**: 修复了 `PromptDetailPane.tsx` 中 `PromptHistorySidebar` 组件和 `IpcPromptVersion`, `IpcOutputSample` 类型定义被意外删除的问题，重新添加了相应的 `import` 语句。
    - **useTheme Import 恢复**: 修复了 `PromptDetailPane.tsx` 中 `useTheme` Hook 被意外删除的问题，重新添加了相应的 `import` 语句。

**Next Steps**:- 实现实际的 AI API 集成（目前是模拟/占位符参数）。
- 添加数据导出/导入功能。
- 优化 Markdown 编辑体验。
- 完善 UI 样式和过渡效果。

---

# 当前任务（Current Task）

> 每次我会在这里写明要你做什么，例如：
>
> - “把现有模板中的主页面替换为 Prompt 管理主界面（左侧列表 + 右侧详情），先只做静态 UI，不接入真实数据。”
> - “在现有 Prompt 界面上增加版本管理：版本标签 + 新建版本按钮，并用内存 store 模拟数据。”
> - “实现本地 JSON 存储，启动时从 JSON 加载 Prompt 列表，关闭前自动保存。”
>
> - “把现有模板中的主页面替换为 Prompt 管理主界面（左侧列表 + 右侧详情），先只做静态 UI，不接入真实数据。”
> - “在现有 Prompt 界面上增加版本管理：版本标签 + 新建版本按钮，并用内存 store 模拟数据。”
> - “实现本地 JSON 存储，启动时从 JSON 加载 Prompt 列表，关闭前自动保存。”
> - “修复 PromptSidebar 和 PromptDetailPane 之间的 UI 对齐问题。”
> - “实现实际的 AI API 集成（目前是模拟/占位符参数）。”
> - “添加数据导出/导入功能。”
>

你只需要根据我给的具体任务，在上面的规则下工作即可。

在你开始前，请先根据仓库结构和上述信息，输出你的 `## Plan`，然后等待我确认。
