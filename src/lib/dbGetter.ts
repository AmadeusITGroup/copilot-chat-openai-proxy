import { execSync } from "child_process";
import { log } from "./logger";

export function queryDB(prompt: string, getDBCommand: string) {
  log("Querying the database");
  const command = prepareGetDBCommand(prompt, getDBCommand);
  log("Command to be executed", { command });
  const out = execSync(command);
  return out.toString();
}

function prepareGetDBCommand(prompt: string, getDBCommand: string) {
  return `${getDBCommand} '${prompt}'`;
}
