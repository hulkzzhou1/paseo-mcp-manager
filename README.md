# MCP Manager for Paseo

在 Paseo 中统一管理外部 MCP 服务，并通过插件钩子将启用的连接配置提供给新建 Agent。

## 计划范围

- 添加、编辑、删除和启停 HTTP／stdio MCP 服务。
- 提供表单与 JSON 编辑模式。
- 按 daemon 保存配置，并保留 Agent 自带的同名连接配置优先级。
- 沿用 `agent.create` 钩子分发配置，由 provider 直接连接 MCP 服务。
- 首期覆盖 Codex（含自定义别名）和 Claude，token 直接保存在配置的 `headers`／`env` 中，不读取额外的 token 文件。

## 当前状态

当前开发切片：添加 HTTP 服务、官方 settings 持久化及 Codex 创建时注入。完整编辑、stdio 和 Claude／别名接入按后续子任务推进。

首期配置变更仅对新建 Agent 生效，不实时更新已有 Agent 的 MCP 配置。各 provider 的兼容范围基于最新社区版 Paseo 验证。

已确认方案见 [MCP Manager 实施方案](docs/plans/mcp-manager.md)。

正式规格见 [GitHub Issue #1](https://github.com/hulkzzhou1/paseo-mcp-manager/issues/1)。

连接凭据与企业内部服务配置保留在本机，不提交到此仓库。

## 本地开发

需要社区版 Paseo 0.13.2 或更高版本，以及支持 TypeScript 类型剥离的 Node.js（开发验证使用 Node 24）。

```bash
npm install --include=dev
npm run typecheck
npm test
npm run test:integration
paseo plugin install /absolute/path/to/paseo-mcp-manager
```

集成测试创建并清理一个只监听本机的独立测试 daemon，不修改日常 daemon 的配置。设置 `PASEO_TEST_PROVIDER=codex` 可额外运行真实 Codex 工具调用测试，需要本机已完成 provider 配置和鉴权，会产生 provider 调用用量。

从侧边栏打开 MCP Manager，填写服务名称、HTTP URL 和 headers JSON。token 直接填写为 header 值，包括服务要求的认证前缀。保存只校验配置；新建受支持的 Agent 后才由 provider 连接服务。

配置使用 host-scoped 插件 settings，以权限受限的普通 JSON 保存。授权编辑端能读取完整值，列表和日志不展示凭据。插件卸载会删除该安装的 settings；reload、停用和重启保留配置。
