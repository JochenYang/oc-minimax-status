/**
 * MiniMax Status OpenCode Plugin
 * 
 * Provides custom tools:
 * - minimax_status: Query usage status
 * - minimax_auth: Set/view authentication info
 */

import { tool } from "@opencode-ai/plugin";
import axios from "axios";
import fs from "fs";
import path from "path";

const CONFIG_PATH = path.join(
  process.env.HOME || process.env.USERPROFILE,
  ".minimax-config.json"
);

function getCredentials() {
  try {
    if (fs.existsSync(CONFIG_PATH)) {
      return JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));
    }
  } catch (error) {
    console.error("Failed to read config:", error.message);
  }
  return null;
}

function saveCredentials(token, groupId) {
  const config = { token, groupId };
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
}

async function fetchUsageStatus(token, groupId) {
  const response = await axios.get(
    "https://www.minimaxi.com/v1/api/openplatform/coding_plan/remains",
    {
      params: { GroupId: groupId },
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      timeout: 10000,
    }
  );
  return response.data;
}

function parseUsageData(apiData) {
  if (!apiData.model_remains || apiData.model_remains.length === 0) {
    throw new Error("No usage data available");
  }

  const m = apiData.model_remains[0];
  const remaining = m.current_interval_usage_count;
  const total = m.current_interval_total_count;
  const used = total - remaining;
  const percentage = Math.round((used / total) * 100);

  const remainingMs = m.remains_time;
  const hours = Math.floor(remainingMs / (1000 * 60 * 60));
  const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));

  const resetTime = new Date(m.end_time).toLocaleString("zh-CN", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

  return {
    modelName: m.model_name,
    used,
    total,
    remaining,
    percentage,
    resetTime,
    hours,
    minutes,
  };
}

function formatOutput(data) {
  const { modelName, used, total, remaining, percentage, resetTime, hours, minutes } = data;
  
  const bar = "█".repeat(Math.floor(percentage / 10)) + "░".repeat(10 - Math.floor(percentage / 10));
  const timeText = hours > 0 ? `${hours}小时${minutes}分钟` : `${minutes}分钟`;

  return `MiniMax Coding Plan 用量状态
----------------------------------------
模型: ${modelName}
已用: ${used.toLocaleString()} / ${total.toLocaleString()}
进度: [${bar}] ${percentage}%
剩余: ${remaining.toLocaleString()} 次
重置: ${resetTime} (约${timeText})
----------------------------------------`;
}

export const MiniMaxStatusPlugin = async (ctx) => {
  return {
    tool: {
      minimax_status: tool({
        description: "查询 MiniMax Coding Plan 使用状态，包括已用次数、剩余次数、进度条和重置时间",
        args: {
          refresh: tool.schema.boolean().optional().describe("强制刷新缓存"),
        },
        async execute(args, context) {
          try {
            const credentials = getCredentials();
            
            if (!credentials?.token || !credentials?.groupId) {
              return `请先配置认证信息！

配置方式：
1. 如果已安装 Claude Code 版 minimax-status，配置文件已自动共享，无需重复配置
2. 或手动创建 ~/.minimax-config.json:
{
  "token": "your-api-token",
  "groupId": "your-group-id"
}

获取 token 和 groupId:
1. 登录 https://platform.minimaxi.com/user-center/payment/coding-plan
2. 获取 API Key 和 Group ID`;
            }

            const apiData = await fetchUsageStatus(credentials.token, credentials.groupId);
            const usageData = parseUsageData(apiData);
            
            return formatOutput(usageData);
          } catch (error) {
            if (error.response?.status === 401) {
              return "认证失败，请检查 token 和 groupId 是否正确";
            }
            if (error.code === "ECONNABORTED") {
              return "请求超时，请检查网络连接";
            }
            return `获取用量失败: ${error.message}`;
          }
        },
      }),

      minimax_auth: tool({
        description: "设置或查看 MiniMax 认证信息",
        args: {
          action: tool.schema.enum(["set", "get"]).default("get").describe("操作: set 设置, get 查看"),
          token: tool.schema.string().optional().describe("API Token"),
          groupId: tool.schema.string().optional().describe("Group ID"),
        },
        async execute(args, context) {
          if (args.action === "get") {
            const creds = getCredentials();
            if (!creds || !creds.token || !creds.groupId) {
              return "未配置认证信息。请使用 action=set 设置 token 和 groupId";
            }
            return `当前认证信息:
- Token: ${creds.token ? "****" + creds.token.slice(-4) : "未设置"}
- GroupID: ${creds.groupId || "未设置"}`;
          }
          
          if (args.action === "set") {
            if (!args.token || !args.groupId) {
              return "设置认证需要提供 token 和 groupId 两个参数";
            }
            saveCredentials(args.token, args.groupId);
            return "认证信息已保存到 ~/.minimax-config.json";
          }
        },
      }),
    },
  };
};

export default MiniMaxStatusPlugin;
