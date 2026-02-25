/**
 * Post-install auto-configuration script
 * 
 * Functions:
 * 1. Copy plugin files to global plugins directory
 * 2. Add plugin to opencode.json
 */

import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const PLUGIN_NAME = "oc-minimax-status";
const PLUGIN_PACKAGE_NAME = "@miloya/oc-minimax-status";

function getGlobalPluginsDir() {
  const home = process.env.HOME || process.env.USERPROFILE;
  return path.join(home, ".config", "opencode", "plugins");
}

function getOpencodeConfigPath() {
  const home = process.env.HOME || process.env.USERPROFILE;
  return path.join(home, ".config", "opencode", "opencode.json");
}

function getCommandDir() {
  const home = process.env.HOME || process.env.USERPROFILE;
  return path.join(home, ".config", "opencode", "command");
}

function getPackageDir() {
  return process.cwd();
}

function updateOpencodeConfig() {
  const configPath = getOpencodeConfigPath();
  let config = {};
  
  // Only read existing config, do NOT create new file if not exists
  if (fs.existsSync(configPath)) {
    try {
      config = JSON.parse(fs.readFileSync(configPath, "utf8"));
    } catch (e) {
      console.warn("Warning: Failed to parse opencode.json, skipping config update");
      return;
    }
  } else {
    console.warn("Warning: opencode.json not found, skipping config update");
    return;
  }

  if (!config.plugin) {
    config.plugin = [];
  }

  // Use @latest to ensure latest version on each startup
  const pluginWithLatest = `${PLUGIN_PACKAGE_NAME}@latest`;
  
  // Remove old plugin config if exists
  config.plugin = config.plugin.filter(p => !p.startsWith("@miloya/oc-minimax"));
  
  // Add latest version config
  if (!config.plugin.includes(pluginWithLatest)) {
    config.plugin.push(pluginWithLatest);
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    console.log("   [OK] Added to opencode.json plugins (with @latest)");
  } else {
    console.log("   [OK] Already in opencode.json plugins");
  }
}

async function init() {
  console.log("\n-- MiniMax Status Plugin Installing --\n");

  const globalPluginsDir = getGlobalPluginsDir();
  const packageDir = getPackageDir();

  if (!fs.existsSync(globalPluginsDir)) {
    fs.mkdirSync(globalPluginsDir, { recursive: true });
    console.log("[OK] Created global plugins directory");
  }

  console.log("-- Copying plugin files...");
  
  // Copy index.js to plugins directory
  const srcIndex = path.join(packageDir, "index.js");
  const destIndex = path.join(globalPluginsDir, `${PLUGIN_NAME}.js`);
  fs.copyFileSync(srcIndex, destIndex);
  console.log(`   [OK] Copied ${PLUGIN_NAME}.js`);

  // Copy command file
  const commandDir = getCommandDir();
  const srcCommand = path.join(packageDir, "command", "minimax.md");
  const destCommand = path.join(commandDir, "minimax.md");

  if (fs.existsSync(srcCommand)) {
    if (!fs.existsSync(commandDir)) {
      fs.mkdirSync(commandDir, { recursive: true });
    }
    fs.copyFileSync(srcCommand, destCommand);
    console.log(`   [OK] Copied /minimax command`);
  }

  console.log("-- Installing dependencies...");
  try {
    execSync("npm install axios", { 
      cwd: globalPluginsDir, 
      stdio: "pipe" 
    });
    console.log("   [OK] Installed axios");
  } catch (e) {
    console.log("   [SKIP] axios already installed");
  }

  console.log("-- Updating OpenCode config...");
  updateOpencodeConfig();

  console.log("\n-- Installation complete --\n");

  console.log("Usage:");
  console.log("   1. Restart OpenCode");
  console.log("   2. In OpenCode, just say:");
  console.log("      '/minimax' or '@minimax status'");
  console.log("      or '查看 minimax 用量'");
  console.log("");
  console.log("   For more info, see README.md\n");
}

init().catch(console.error);
