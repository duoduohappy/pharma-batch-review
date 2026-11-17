# 批证 · 跨系统批次复核工作台

[![Test batch review](https://github.com/duoduohappy/pharma-batch-review/actions/workflows/ci.yml/badge.svg)](https://github.com/duoduohappy/pharma-batch-review/actions/workflows/ci.yml)

[部署到 Render](https://render.com/deploy?repo=https://github.com/duoduohappy/pharma-batch-review) · [部署说明](DEPLOY_RENDER.md)

面试与业务讨论演示：WMS 仓储 + LIMS 检验 + MES 生产 → 确定性检查 → 带来源摘要 → 人工模拟签核 → 版本整改复验。

## 最快启动

Node.js 22+，无 npm 依赖。Windows 双击 `start.cmd`，打开 http://127.0.0.1:18771 。也可在本目录执行 `node server.mjs`。浏览器须与服务在同一台电脑，不能直接双击 HTML。

## 五分钟演示

1. 选择第二批“检验与仓储冲突”，运行复核：含量 92.3 低于虚构下限 95，仓储却已放行，且 OOS 调查未关闭。
2. 点击异常卡片，查看来源记录和模拟 SOP；打开人工签核，确认批准被阻止。
3. 生成摘要：默认明确标为规则摘要，内容引用 F01 等证据。配置模型后才发起真实模型调用。
4. 选择第三批“记录缺失”，先复核，导出初始证据；点击“导入模拟整改版本”，补独立复核、包装记录和仓储状态。旧快照保留，审批清除。
5. 重新复核 v2，通过后填写 QA 审核人和意见进行模拟签核。刷新页面确认历史保留，导出完整 JSON 证据包。

JSON 导入支持完整当前批次或单系统 `{ "system":"lims", "data":{...} }`。下载当前模板后修改，仅接受模拟数据。主数据和必检清单不可放宽；UI 阻止覆盖已导入的原始 OOS 数值。本版没有实现 OOS 调查后的质量处置放行。

## 可选真实模型

后端读取 `LLM_BASE_URL`（OpenAI-compatible，含 `/v1`）、`LLM_MODEL`、可选 `LLM_API_KEY`。不将密钥写入前端、仓库或演示包。例：本地 Ollama 启动且已安装模型时，PowerShell 设置 `$env:LLM_BASE_URL='http://127.0.0.1:11434/v1'` 和 `$env:LLM_MODEL='qwen3:4b'`，然后 `node server.mjs`。

请求只包含规则检查证据，不包含完整来源文件。30 秒超时、错误或证据 ID 校验失败时回退规则摘要。模型不能改变门禁或批准批次；引用校验不能证明模型语义完全正确。当前默认交付没有启用真实模型，不宣称模型效果已验证。

## 结构与验证

- `core.mjs`：固定演示规则、快照指纹、复核及模拟签核校验。
- `api.mjs`：本地 / Worker 共用 API、可选真实模型解释及规则回退。
- `index.html` / `app.js`：来源、检查、版本、签核和证据导出。
- `node --test tests.mjs`：门禁、边界、数据变更、OOS、引用错误及回退测试。
- `node build.mjs`：输出 Sites Worker ESM，静态资源内嵌。
- `npm run test:smoke`：启动真实 HTTP 服务，验证云端监听、页面、阻断、整改与签核。Render 直接执行 `npm start`，无需 Sites 专用构建或 `.openai/hosting.json`。

## 边界

数据和 SOP 为自编虚构，未接入真实药厂 WMS/LIMS/MES，未做药企业务审核、计算机化系统验证或合规认证。主数据仅一套演示模板，检查范围有限，不支持任意物料、工艺、检验标准或正式电子签名。

历史、快照、审批保存在浏览器 localStorage：刷新保留，同一站点、浏览器和配置文件内使用；不是服务器数据库、多人协作、不可篡改日志或正式放行凭证。审核人是模拟输入；用户可清除或修改本地数据。API 针对提交快照重算门禁，不是防恶意客户端的生产权限系统。不录入真实患者、企业或药品质量数据。

项目尚无真实业务收益、模型准确率和生产验证结论。

## 开源复用

LabVault 的限值判定函数已移植为 JavaScript 并实际用于检查，保留 MIT 许可和原始函数。mcp-lims 仅作为状态机设计参考，未引入运行依赖。详见 THIRD_PARTY.md。
