# Prompt Manager Feature

## Overview
The Prompt Manager is a local-first application for managing LLM prompts and their versions.

## Structure
- **Entry**: `src/renderer/screens/main.tsx` renders `PromptManagerScreen`.
- **Feature Folder**: `src/renderer/features/prompts`
  - `components/PromptSidebar.tsx`: Left sidebar with prompt list and search.
  - `components/PromptDetailPane.tsx`: Right pane with metadata form and prompt editor.
  - `screens/PromptManagerScreen.tsx`: Layout container using `react-resizable-panels`.

## Current Status
- **UI**: Static implementation using shadcn/ui components.
- **Data**: Mock data hardcoded in components.
- **Storage**: Not yet implemented (planned: local JSON/File system).

## Components Used
- Button, Input, Textarea, Card, Separator, Badge, ScrollArea, Tabs, Select, Label, Resizable, Form.
