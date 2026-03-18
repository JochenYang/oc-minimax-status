/**
 * Update script - syncs plugin files to global plugins directory
 * Run manually after code updates without needing full npm reinstall
 */

import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const PLUGIN_NAME = "oc-minimax-status";

function getGlobalPluginsDir() {
  const home = process.env.HOME || process.env.USERPROFILE;
  return path.join(home, ".config", "opencode", "plugins");
}

function getCommandDir() {
  const home = process.env.HOME || process.env.USERPROFILE;
  return path.join(home, ".config", "opencode", "commands");
}

function getPackageDir() {
  const pkgJson = process.env.npm_package_json;
  if (pkgJson) {
    return path.dirname(pkgJson);
  }
  return process.cwd();
}

async function update() {
  console.log("\n-- MiniMax Status Plugin Updating --\n");

  const globalPluginsDir = getGlobalPluginsDir();
  const packageDir = getPackageDir();

  // Sync index.js
  console.log("-- Syncing plugin files...");
  const srcIndex = path.join(packageDir, "index.js");
  const destIndex = path.join(globalPluginsDir, `${PLUGIN_NAME}.js`);

  if (!fs.existsSync(srcIndex)) {
    console.error(`   [FAIL] Source file not found: ${srcIndex}`);
    console.log("   Make sure you run this from the plugin directory.");
    return;
  }

  fs.copyFileSync(srcIndex, destIndex);
  console.log(`   [OK] Synced ${PLUGIN_NAME}.js`);

  // Sync command files
  const commandDir = getCommandDir();
  if (!fs.existsSync(commandDir)) {
    fs.mkdirSync(commandDir, { recursive: true });
  }

  const cmdFiles = ["minimax.md", "minimax-set.md", "minimax-update.md"];
  for (const cmdFile of cmdFiles) {
    const srcCommand = path.join(packageDir, "commands", cmdFile);
    const destCommand = path.join(commandDir, cmdFile);
    if (fs.existsSync(srcCommand)) {
      fs.copyFileSync(srcCommand, destCommand);
      console.log(`   [OK] Synced /${cmdFile.replace(".md", "")} command`);
    }
  }

  // Ensure axios is installed
  console.log("-- Checking dependencies...");
  try {
    execSync("npm install axios", {
      cwd: globalPluginsDir,
      stdio: "pipe"
    });
    console.log("   [OK] axios installed");
  } catch (e) {
    console.log("   [SKIP] axios already installed");
  }

  console.log("\n-- Update complete --\n");
  console.log("Restart OpenCode to use the updated plugin.\n");
}

update().catch(console.error);
