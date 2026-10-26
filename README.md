# MCP Manager for Paseo

在 Paseo 中统一管理外部 MCP 服务，并通过插件钩子将启用的连接配置提供给新建 Agent。

## 计划范围

- 添加、编辑、删除和启停 HTTP／stdio MCP 服务。
- 提供表单与 JSON 编辑模式。
- 按 daemon 保存配置，并保留 Agent 自带的同名连接配置优先级。
- 沿用 `agent.create` 钩子分发配置，由 provider 直接连接 MCP 服务。
- 首期覆盖 Codex（含自定义别名）和 Claude，token 直接保存在配置的 `headers`／`env` 中，不读取额外的 token 文件。

## 当前状态

项目已初始化，功能尚未实现。现有本地 `iwiki-mcp` 插件作为接入模式参考。

首期配置变更仅对新建 Agent 生效，不实时更新已有 Agent 的 MCP 配置。各 provider 的兼容范围基于最新社区版 Paseo 验证。

已确认方案见 [MCP Manager 实施方案](docs/plans/mcp-manager.md)。

正式规格见 [GitHub Issue #1](https://github.com/hulkzzhou1/paseo-mcp-manager/issues/1)。

连接凭据与企业内部服务配置保留在本机，不提交到此仓库。
