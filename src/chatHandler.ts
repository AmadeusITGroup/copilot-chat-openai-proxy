import * as vscode from "vscode";
import { intentHandlers } from "./chatcommands";
import { VSCodeElements } from "./chatcommands/chatCommandHandler";

export async function chatHandler(
  request: vscode.ChatRequest,
  context: vscode.ChatContext,
  stream: vscode.ChatResponseStream,
  token: vscode.CancellationToken,
): Promise<vscode.ChatResult> {
  const keySet = new Set(Array.from(intentHandlers.keys()));
  if (!keySet.has(request.command ?? "")) {
    stream.markdown(
      "No handler registered for chat command: " + request.command,
    );
    return {};
  }

  const intentHandler = intentHandlers.get(request.command ?? "");
  if (!intentHandler) {
    stream.markdown(
      "Error: Intent handler not found for command: " + request.command,
    );
    return { metadata: { command: request.command || "" } };
  }

  const preFlightCheckResult = intentHandler.preFlightCheck();
  if (!preFlightCheckResult.success) {
    stream.markdown("Error: " + preFlightCheckResult.message);
    return { metadata: { command: request.command || "" } };
  }

  const vsCodeElements: VSCodeElements = {
    request: request,
    context: context,
    stream: stream,
    token: token,
  };
  const newVsCodeElements: VSCodeElements = {
    request: await intentHandler.preProcess(vsCodeElements),
    context: context,
    stream: stream,
    token: token,
  };
  const processResult = await intentHandler.process(newVsCodeElements);
  const requestWithProcessResult: vscode.ChatRequest = {
    prompt: processResult ?? "",
    command: vsCodeElements.request.command,
    references: vsCodeElements.request.references ?? [],
    toolReferences: vsCodeElements.request.toolReferences ?? [],
    toolInvocationToken: vsCodeElements.request.toolInvocationToken,
    model: vsCodeElements.request.model,
  };
  const result = await intentHandler.postProcess({
    request: requestWithProcessResult,
    context: context,
    stream: stream,
    token: token,
  });

  if (result) {
    stream.markdown(result);
  } else if (processResult) {
    stream.markdown(processResult);
  } else {
    stream.markdown("Error: No result found for command: " + request.command);
  }
  return { metadata: { command: request.command || "" } };
}
