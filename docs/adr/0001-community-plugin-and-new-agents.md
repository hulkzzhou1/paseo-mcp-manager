# 基于社区版插件接口，仅向新建 Agent 提供 MCP 配置

MCP Manager 作为独立插件构建在社区版 Paseo 的公开接口上，通过 `agent.create` 为新建 Agent 提供启用的受管 MCP 服务，由 provider 建立实际连接。该选择避免依赖定制宿主的 MCP 服务目录及运行时配置覆盖机制；代价是配置修改、停用和删除只影响之后新建的 Agent，不实时修改已有 Agent 的 MCP 配置。
