# MCP Manager for Paseo

在 Paseo 中统一管理外部 MCP 服务，并通过插件钩子将启用的连接配置提供给新建 Agent。

## 计划范围

- 添加、编辑、删除和启停 HTTP／stdio MCP 服务。
- 提供表单与 JSON 编辑模式。
- 按 daemon 保存配置，并保留 Agent 自带的同名连接配置优先级。
- 沿用 `agent.create` 钩子分发配置，由 provider 直接连接 MCP 服务。

## 当前状态

项目已初始化，功能尚未实现。现有本地 `iwiki-mcp` 插件作为接入模式参考。

首期配置变更针对新建 Agent 生效。已有 Agent 的配置更新及各 provider 的兼容范围需要进一步验证。

连接凭据与企业内部服务配置保留在本机，不提交到此仓库。
