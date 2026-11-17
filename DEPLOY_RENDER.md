# Render 部署

[打开 Render Blueprint 部署](https://render.com/deploy?repo=https://github.com/duoduohappy/pharma-batch-review)

首次需要仓库所有者登录 Render，选择工作区，授权访问本仓库并确认创建免费 Web Service。本仓库已提供 render.yaml；未配置真实模型也可以运行完整规则演示。

## Blueprint

1. 点击上面的部署链接，或在 Render 选择 New → Blueprint，连接 `duoduohappy/pharma-batch-review`。
2. 读取 main 分支根目录的 render.yaml，检查 `plan: free`，确认创建。
3. 等服务显示 Live，使用 Render 实际分配的 HTTPS 地址；不要猜测子域名。
4. 打开 `/api/health`，应返回 `ok:true`、`model:not-configured`、`simulation:true`。

Blueprint 设置 `autoDeployTrigger: checksPass`：main 更新后，GitHub CI 成功才自动部署。首次部署在创建服务时执行。不要再同时添加 Deploy Hook，以免重复触发。

## 手工创建 Web Service

若 Blueprint 未成功读取，可选择 New → Web Service → 连接本仓库：

| 配置 | 值 |
|---|---|
| Branch | main |
| Runtime | Node |
| Root Directory | 留空 |
| Build Command | `npm test` |
| Start Command | `npm start` |
| Health Check Path | `/api/health` |
| Instance Type | Free |
| HOST 环境变量 | `0.0.0.0` |
| NODE_ENV | `production` |
| Auto-Deploy | After CI Checks Pass |

Node 版本由 package.json 锁定到 22 大版本。程序读取 Render 的 PORT，不硬编码生产端口。无第三方 npm 依赖，不需要数据库或持久磁盘。Render 无需运行 Sites 专用的 `npm run build`。

## 部署后的验收

- 页面、`/app.js`、`/api/health` 均正常返回。
- 第二批运行复核得到三项阻断，不能批准。
- 第三批导入模拟整改版本，复验通过后才可人工模拟签核。
- 刷新后本浏览器记录仍在；导出的 JSON 包含版本和来源。

云服务重启不会主动清除浏览器 localStorage；换域名、浏览器、无痕会话或清除站点数据后记录不共享。本版没有服务器数据库或多人审批。

## 模型与公开演示

默认不调用模型、不需要 API Key。可在 Render 私有环境变量配置 LLM_BASE_URL、LLM_MODEL、LLM_API_KEY；云端不能访问你电脑的 127.0.0.1 Ollama。公开匿名演示不要直接挂带费用的模型密钥，先补认证和额度限制。所有演示数据须为模拟数据，不上传企业资料。

免费实例可能休眠，首次访问需要等待冷启动。当前代码无真实药品放行或 GMP 合规认证；只用于演示。

参考：[Render Web Services](https://render.com/docs/web-services)、[Blueprint Spec](https://render.com/docs/blueprint-spec)。
