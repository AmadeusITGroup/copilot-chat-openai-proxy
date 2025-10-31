import * as vscode from "vscode";
import { chatHandler } from "./chatHandler";
import { setDisplayNameLogging } from "./lib/logger";
import { registerIntentHandlers } from "./chatcommands";
import { setExtensionContext } from "./lib/extensionContext";

// import { getTelemetryClient } from "./lib/telemetry";
// import { TelemetryEventTypes } from "@vscode-amadeus/core-services";

const CHAT_PARTICIPANT_ID = "chat-participant-openai-proxy.chat";

export function activate(context: vscode.ExtensionContext) {
  setExtensionContext(context);
  // Telemetry data
  // getTelemetryClient().activate();
  // getTelemetryClient().registerTasks();

  setDisplayNameLogging(context.extension.packageJSON.displayName);
  registerChatParticipant(context);
  registerIntentHandlers();
}

function registerChatParticipant(context: vscode.ExtensionContext) {
  const participant = vscode.chat.createChatParticipant(
    CHAT_PARTICIPANT_ID,
    chatHandler,
  );
  participant.iconPath = vscode.Uri.joinPath(
    context.extensionUri,
    "resources",
    "icon.svg",
  );
  context.subscriptions.push(participant);

  // Register your chat participants here
  const llmproxyParticipant = vscode.chat.createChatParticipant(
    "chat-participant-openai-proxy.llmproxy",
    chatHandler,
  );
  context.subscriptions.push(llmproxyParticipant);
  // end chat participants registration

  // Thumbs up/down telemetry
  llmproxyParticipant.onDidReceiveFeedback(
    (feedback: vscode.ChatResultFeedback) => {
      // getTelemetryClient().sendEvent(TelemetryEventTypes.LOG, {
      //   name: "ChatFeedback",
      //   command: feedback.result.metadata?.command,
      //   value: feedback.kind,
      // });
    },
  );
  // end of example chat participants
}

export function deactivate() {
  console.log("Deactivating extension");
  // getTelemetryClient().dispose();
}
