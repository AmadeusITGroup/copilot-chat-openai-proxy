import * as vscode from "vscode";
import { log } from "../lib/logger";

interface CustomCommand extends vscode.Command {
  execute: () => Promise<string | void>;
}

export abstract class Command implements CustomCommand {
  title = "";
  command = "";
  statusBarMessage = "";

  async execute(): Promise<void | string> {
    log(`\n\n-----------------------`);
    log(`Execute the command: ${this.title}`);
    return this.executeCommand()
      .catch((error) => {
        log(`ERROR when running the command: ${this.title}`);

        if (error.name === "Error") {
          vscode.window.showErrorMessage(error.toString(), "Show logs");
        }
        if (error.name === "CancelProcess") {
          log(`Command cancel by the user: ${error.message}`);
        }
      })
      .finally(() => {
        log("End of the command execution");
      });
  }

  abstract executeCommand(): Promise<void | string | undefined>;

  register(context: vscode.ExtensionContext): void {
    context.subscriptions.push(
      vscode.commands.registerCommand(this.command, () => this.execute()),
    );
  }
}
