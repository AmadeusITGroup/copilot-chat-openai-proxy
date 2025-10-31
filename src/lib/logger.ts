import * as vscode from "vscode";

let applicationName: string = "amadeus-chat-participant";
let outputChannel: vscode.OutputChannel;

export function setDisplayNameLogging(name: string) {
  applicationName = name;
}

function getOutputChannel() {
  if (outputChannel) {
    return outputChannel;
  }
  outputChannel = vscode.window.createOutputChannel(applicationName);
  return outputChannel;
}

export function log(message: string, data?: object) {
  const outputChannel = getOutputChannel();
  outputChannel.appendLine(message);
  if (data) {
    outputChannel.appendLine(JSON.stringify(data, null, 2));
  }
}
