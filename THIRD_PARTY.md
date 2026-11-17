# 第三方来源与复用

1. LabVault：https://github.com/kemval/labvault ，MIT，Copyright (c) 2026 Kembly。`views/test_results.py` 中 `determine_status` 移植为 `core.mjs` 的 `determineStatus`，实际用于数值上下限判定。原始函数与许可证见 vendor/。移植调用前增加数值有效性、单位、必检项目及固定主数据校验；不复用其 0.0 限值视为空的表单逻辑、认证代码或合规宣称。此为小函数复用，并非集成整套 LabVault。
2. mcp-lims：https://github.com/zavora-ai/mcp-lims 。阅读其样品、OOS、独立复核、批次门禁设计作为参考；没有复制代码，也没有运行其服务。仓库提供 Apache-2.0 许可文字。
3. 未集成 QAtrial、SENAITE，不将其功能或验证结果算作本项目成果。

公开仓库的功能介绍不等于经过制药生产验证。本项目规则、数据与模型提示均独立编写，模拟 SOP 不作为真实法规来源。
