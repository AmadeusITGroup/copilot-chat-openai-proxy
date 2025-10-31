import * as vscode from "vscode";
export const SECTION_NAME = "1a-chat-participant-openai-proxy";

export enum SettingKey {}
// Global settings go here...

export function getSetting(key: SettingKey): string {
  return (
    vscode.workspace.getConfiguration(SECTION_NAME).get(key.toString()) ?? ""
  );
}
