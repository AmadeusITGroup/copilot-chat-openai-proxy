import { execSync } from "child_process";
import { log } from "./logger";

export function getContextPrompt(prompt: string, contextCommand: string) {
  log("Getting context prompt");
  const command = prepareContextPromptCommand(prompt, contextCommand);
  log("Command to be executed", { command });
  const out = execSync(command);
  return out.toString();
}

function prepareContextPromptCommand(prompt: string, contextCommand: string) {
  return `${contextCommand} ${prompt}`;
}
