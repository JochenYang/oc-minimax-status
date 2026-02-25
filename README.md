<h1 align="center">MiniMax Status - OpenCode 插件</h1>

<p align="center">
  <a href="https://www.npmjs.com/package/@miloya/oc-minimax-status"><img src="https://img.shields.io/npm/v/@miloya/oc-minimax-status?color=blue" alt="npm version"></a>
  <a href="https://www.npmjs.com/package/@miloya/oc-minimax-status"><img src="https://img.shields.io/npm/dw/@miloya/oc-minimax-status?color=green" alt="npm downloads"></a>
  <a href="LICENSE"><img src="https://img.shields.io/npm/l/@miloya/oc-minimax-status?color=orange" alt="license"></a>
  <a href="https://opencode.ai"><img src="https://img.shields.io/badge/Platform-Windows%20%7C%20macOS%20%7C%20Linux-blue?color=blue" alt="Platform"></a>
</p>

<p align="center">
  <em>MiniMax Coding Plan 用量查询插件 for OpenCode - 一键安装自动配置</em>
</p>

---

## 功能特性

- 实时用量查询 - 查询 MiniMax Coding Plan 使用状态
- 安全认证 - 安全的 token 和 groupId 管理，配置文件与 Claude Code CLI 状态栏版共享（Windows: `%USERPROFILE%\.minimax-config.json`，macOS/Linux: `~/.minimax-config.json`）
- 美观输出 - 终端友好的进度条展示
- 一键安装 - 自动安装到全局插件目录，无需手动配置

## 安装

```bash
npm install @miloya/oc-minimax-status
```

安装过程会自动：
1. 复制插件到全局插件目录 (~/.config/opencode/plugins)
2. 复制 /minimax 命令到全局命令目录 (~/.config/opencode/command)
3. 添加插件到 opencode.json 配置
4. 显示使用说明

## 配置认证

插件会复用 Claude Code CLI 版 minimax-status 的配置文件，如果已配置过则无需重复配置。

配置文件路径：
- Windows: `%USERPROFILE%\.minimax-config.json`
- macOS/Linux: `~/.minimax-config.json`

如需手动配置，创建上述文件：

```json
{
  "token": "your-api-token",
  "groupId": "your-group-id"
}
```

### 如何获取 token 和 groupId

1. 登录 [https://platform.minimaxi.com/user-center/payment/coding-plan](https://platform.minimaxi.com/user-center/payment/coding-plan)
2. 获取 API Key 和 Group ID

## 使用方法

在 OpenCode 对话框中直接说**自然语言**即可（不是命令行），插件会自动识别并调用对应功能：

### 查询用量（自然语言）
```
查看 minimax 用量
我的用量还有多少
minimax 状态
/minimax
```

### 管理认证（自然语言）
```
查看 minimax 认证
设置 minimax 认证 tokenxxx groupIdxxx
```

### 直接调用工具名
```
minimax_status
minimax_auth action=get
minimax_auth action=set token=xxx groupId=xxx
```

## 输出示例

### 用量查询成功

```
MiniMax Claude Code 用量状态
==============================
Model: MiniMax-M2
已用: 1,500 / 4,500
进度: [███░░░░░░] 33%
剩余: 3,000
重置: 2026/02/26 14:30 (2h 30m)
==============================
```

### 未配置认证

```
请先配置认证信息！

配置方式：
1. 如果已安装 Claude Code 版 minimax-status，配置文件已自动共享，无需重复配置
2. 或手动创建 ~/.minimax-config.json:
{
  "token": "your-api-token",
  "groupId": "your-group-id"
}

获取 token 和 groupId:
1. 登录 https://platform.minimaxi.com/user-center/payment/coding-plan
2. 获取 API Key 和 Group ID
```

## 相关项目

- [oc-minimax-status](https://github.com/JochenYang/oc-minimax-status) - OpenCode 插件版（本项目）
- [minimax-status](https://github.com/JochenYang/minimax-status) - CLI 版用量查询工具

## License

MIT License - see [LICENSE](LICENSE) file for details.
