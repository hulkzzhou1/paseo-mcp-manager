# MCP 管理

从 Paseo 侧边栏管理 HTTP 和 stdio MCP 连接。可通过表单或单服务 JSON 编辑器添加、编辑、重命名、启停和删除服务。每个 daemon 独立保存定义。

连接以卡片展示，新增和编辑在弹窗中完成。界面跟随应用语言，支持英文和简体中文，其他语言回退到英文。

已启用的配置只注入之后新建的 Codex、Claude Agent，以及继承链可解析到这两个 provider 的自定义别名。Agent 显式配置的同名连接整体优先。已有 Agent 及其恢复流程保留原配置。启用仅代表已配置，不代表已连接；保存只校验结构，不连接服务或启动命令。

需要 daemon 和客户端均为社区版 Paseo 0.13.2 或更新版本，并已配置、登录 Codex 或 Claude。HTTP 填写 URL 和可选字符串 headers；stdio 填写 daemon 上可用的可执行程序、参数数组及环境变量，沿用 Agent 的执行上下文。参数字符串不按空格拆分。可选 alwaysLoad 的效果取决于 provider。

token 直接填入 headers 或 env，包含服务要求的认证前缀。配置以权限受限的普通本机 JSON 保存，不提供加密秘密存储；授权编辑端能读取完整值。连接配置会传给所选 provider；HTTP 请求将配置的 headers 发往服务，stdio 子进程会收到配置的 env。列表和插件诊断省略连接值。过期 token 需手工替换，仅影响未来新建的 Agent。

过期 revision 的保存会被拒绝并保留草稿。重新读取配置后，需明确选择以最新版本为基础继续保存。插件 reload、停用后启用以及 daemon 重启保留配置；卸载会删除该安装的 settings，卸载前请自行保留需要的定义。
