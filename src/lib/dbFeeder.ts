import { execSync } from "child_process";
import { log } from "./logger";

export function feedDB(
  folderPaths: string[],
  feedCommand: string,
  options: { cwd: string },
) {
  // Feed the database with the folder paths
  log("Feeding the database with the folder paths", folderPaths);
  const command = prepareFeedCommand(folderPaths, feedCommand);
  log("Command to be executed", { command });
  const out = execSync(command, options);
  console.log(out.toString());
  return;
}

function prepareFeedCommand(folderPaths: string[], feedCommand: string) {
  return `${feedCommand} ${folderPaths.join(" ")}`;
}
