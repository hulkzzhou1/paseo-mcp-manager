# 界面中英文对照

界面跟随 Paseo 的应用语言，支持 English 和简体中文；其他语言回退到英文。切换语言保留编辑草稿。服务名称、JSON 字段、命令和凭据不翻译。

| Key | English | 简体中文 |
| --- | --- | --- |
| managerTitle | MCP Manager | MCP 管理 |
| connectionsTitle | MCP connections | MCP 连接 |
| scopeHint | Saved connections apply only to new agents. Existing agents keep their configuration. | 保存的连接仅对新建 Agent 生效，已有 Agent 保持原配置。 |
| providerHint | HTTP / stdio · Codex, Claude and their provider aliases. Enabled means configured, not connected. Saving does not connect or start commands. | 支持 HTTP / stdio、Codex、Claude 及其 provider 别名。启用代表将提供配置，不代表已连接；保存不会连接服务或启动命令。 |
| addService | Add service | 添加服务 |
| editNamed | Edit {{name}} | 编辑 {{name}} |
| serviceName | Service name | 服务名称 |
| enabledNew | Enabled for new agents | 对新建 Agent 启用 |
| connectionEditor | Connection editor | 连接编辑器 |
| editJson | Edit JSON | 编辑 JSON |
| useForm | Use form | 使用表单 |
| connectionJson | Connection JSON | 连接 JSON |
| connectionHint | The name and enabled state are managed separately. Only supported connection fields are accepted. | 名称和启用状态单独管理。仅接受支持的连接字段。 |
| transport | Transport | 传输方式 |
| url | URL | URL |
| headers | Headers (JSON) | 请求头（JSON） |
| headersHint | Enter tokens directly, including any Bearer prefix. Stored as restricted local JSON and readable by authorized editing clients. | 直接填写 token，包含所需的 Bearer 前缀。配置以受限权限的本地 JSON 保存，获授权的编辑客户端可读取。 |
| headersInput | HTTP headers JSON | HTTP 请求头 JSON |
| command | Command | 命令 |
| arguments | Arguments (JSON array) | 参数（JSON 数组） |
| argumentsHint | Each string is one argument. Spaces and special characters are preserved; no shell splitting. | 每个字符串对应一个参数，保留空格和特殊字符，不进行 shell 拆分。 |
| argumentsInput | stdio arguments JSON | stdio 参数 JSON |
| environment | Environment (JSON) | 环境变量（JSON） |
| environmentHint | Enter tokens as literal values. Stored as restricted local JSON and readable by authorized editing clients. The provider runs commands in the agent context. | 直接填写 token 值。配置以受限权限的本地 JSON 保存，获授权的编辑客户端可读取。provider 在 Agent 上下文中运行命令。 |
| environmentInput | stdio environment JSON | stdio 环境变量 JSON |
| toolLoading | Tool loading | 工具加载方式 |
| providerDefault | Provider default | 使用 provider 默认值 |
| alwaysLoad | Always load | 始终加载 |
| onDemand | On demand | 按需加载 |
| saving | Saving… | 保存中… |
| saveService | Save service | 保存服务 |
| cancel | Cancel | 取消 |
| validationConnection | Use an HTTP/HTTPS URL and string headers, or a nonempty stdio command, JSON string args array and string env values. alwaysLoad must be a boolean. Unknown fields and unsupported transports are rejected. Check JSON syntax if using JSON. | 请填写 HTTP/HTTPS URL 和字符串请求头，或非空 stdio 命令、字符串参数数组及字符串环境变量。alwaysLoad 必须为布尔值，不接受未知字段或不支持的传输方式；使用 JSON 时请检查语法。 |
| validationDuplicate | A service with this name already exists. Choose another name. | 已存在同名服务，请使用其他名称。 |
| validationName | Names must contain letters, numbers, hyphens or underscores. paseo and JavaScript prototype names are reserved. | 名称只能包含字母、数字、连字符或下划线。paseo 及 JavaScript 原型名称为保留名称。 |
| saveConflict | Save failed or another client changed the settings. Your draft is preserved. Reload, review the current list, then explicitly use that version with your draft before retrying. Saving will replace this service; other services use the reloaded version. | 保存失败，或其他客户端已修改配置。草稿已保留。请重新加载并核对当前服务列表，明确选择将最新版本用于草稿后再重试。保存将替换当前服务，其他服务沿用重新加载的版本。 |
| keepDraftReload | Keep this draft and read current settings | 保留草稿并读取当前配置 |
| reloadSaved | Reload saved version | 重新加载已保存版本 |
| baseHint | Use the displayed saved version as the base for this draft | 将当前显示的已保存版本作为草稿的基准 |
| useLatest | Use latest version with draft | 将最新版本用于草稿 |
| saved | Saved for new agents. | 已保存，将对新建 Agent 生效。 |
| saveFailed | Save failed or settings changed. Reload before retrying; nothing was overwritten. | 保存失败或配置已变化。请重新加载后重试，未覆盖任何内容。 |
| deleted | Service deleted for new agents. | 服务已删除，将对新建 Agent 生效。 |
| deleteFailed | Delete failed or settings changed. Cancel this confirmation and reload before trying again. | 删除失败或配置已变化。请取消本次确认，重新加载后再试。 |
| loading | Loading connections… | 正在加载连接… |
| invalidTitle | Saved configuration is invalid | 已保存的配置无效 |
| readErrorTitle | Unable to read connections | 无法读取连接 |
| invalidHint | The saved values do not match the configuration format. Correct the stored configuration before creating agents. Your data has not been reset. | 已保存的数据不符合配置格式。请修正后再新建 Agent，现有数据未被重置。 |
| readErrorHint | The daemon could not be reached or the read failed. Reconnect and try again. Your data has not been reset. | 无法连接 daemon 或读取失败。请重新连接后重试，现有数据未被重置。 |
| readAgain | Read saved configuration again | 重新读取已保存配置 |
| reload | Reload | 重新加载 |
| servicesCount | Services ({{count}}) | 服务（{{count}}） |
| empty | No services yet. Add a connection to get started. | 暂无服务。添加连接即可开始使用。 |
| disabled | Disabled | 已停用 |
| edit | Edit | 编辑 |
| delete | Delete | 删除 |
| removeNamed | Remove {{name}} | 删除 {{name}} |
| deleteTitle | Delete {{name}}? | 删除 {{name}}？ |
| deleteHint | This removes its saved definition. Existing agents keep their configuration. | 将删除已保存的服务定义，已有 Agent 保持原配置。 |
| confirmDelete | Confirm deletion | 确认删除 |
| currentServices | Current saved services: {{names}} | 当前已保存服务：{{names}} |
| enabled | Enabled | 已启用 |
| enableNamed | Enable {{name}} for new agents | 对新建 Agent 启用 {{name}} |
