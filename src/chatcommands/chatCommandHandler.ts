import * as vscode from "vscode";
import { SECTION_NAME } from "../lib/vscSettings";

interface CheckResult {
  success: boolean;
  message: string;
}

/**
 * ChatCommandHandler is an abstract class that defines the interface for chat commands handlers.
 * Chat command handlers are responsible for handling the chat participant commands.
 * Use the "@" sign to trigger the chat participant, then type "/" to trigger the chat command.
 * e.g. `@example /tts`
 */
export abstract class ChatCommandHandler {
  /**
   * The name of the chat command handler.
   */
  public name: string = "";

  /**
   * Performs a preflight check to ensure that all necessary conditions are met before executing a command.
   *
   * This method should be implemented by subclasses to provide specific preflight check logic.
   *
   * @returns {boolean} - Returns `true` if the preflight check passes, otherwise `false`.
   */
  abstract preFlightCheck(): { success: boolean; message: string };

  /**
   * Retrieves the value of a setting based on the provided key.
   *
   * @param key - The key of the setting to retrieve.
   * @returns The value of the setting as a string.
   */
  public getSetting(key: string): string {
    return (
      vscode.workspace
        .getConfiguration(SECTION_NAME + "." + this.name)
        .get(key) ?? ""
    );
  }

  /**
   * Pre-processes the VSCode elements to generate a chat request.
   *
   * @param vsCodeElements - The VSCode elements to be pre-processed.
   * @returns The generated chat request.
   */
  abstract preProcess(
    vsCodeElements: VSCodeElements,
  ): Promise<vscode.ChatRequest>;

  /**
   * Processes the VSCode elements or null.
   *
   * @param vsCodeElements - The VSCode elements to be processed. Can be null.
   * @returns A promise that resolves to void, string, or undefined.
   */
  abstract process(
    vsCodeElements: VSCodeElements | null,
  ): Promise<string | undefined>;

  /**
   * Post-processes the chat command handler.
   *
   * @returns A promise that resolves to void, string, or undefined.
   */
  abstract postProcess(vsCodeElements: VSCodeElements): Promise<string | null>;

  protected missingSettingsPreflightCheck(
    requiredSettings: string[],
  ): CheckResult {
    const missingSettings = requiredSettings.filter(
      (setting) =>
        this.getSetting(setting) === null || this.getSetting(setting) === "",
    );
    if (missingSettings.length > 0) {
      const message =
        "The following settings are missing: " + missingSettings.join("\n");

      return { success: false, message: message };
    }

    return { success: true, message: "" };
  }
}

export type VSCodeElements = {
  request: vscode.ChatRequest;
  context: vscode.ChatContext;
  stream: vscode.ChatResponseStream;
  token: vscode.CancellationToken;
};
