import * as vscode from "vscode";

export function setExtensionContext(ctx: vscode.ExtensionContext): void {
  context = ctx;
}

export function getExtensionContext(): vscode.ExtensionContext {
  return context;
}

export let context: vscode.ExtensionContext;
