import * as vscode from "vscode";
import { log } from "./logger";
import { VSCodeElements } from "../chatcommands/chatCommandHandler";

export interface promptResponse {
  response: string;
  error?: vscode.LanguageModelError;
}

export async function sendMessages(
  messages: vscode.LanguageModelChatMessage[],
  model: vscode.LanguageModelChat,
  cancellationToken: vscode.CancellationToken,
): Promise<promptResponse> {
  let lastError: vscode.LanguageModelError | undefined;

  log(`Using model ${model.family}`);
  try {
    const response = await model.sendRequest(messages, {}, cancellationToken);
    let finalResponse = "";
    for await (const chunk of response.text) {
      finalResponse += chunk;
    }
    return { response: finalResponse };
  } catch (e) {
    console.error({ model, error: e });
    lastError = {
      name: `Error on sendRequest for model ${model.id}`,
      message: JSON.stringify(e),
      code: "Unknown",
    };
  }
  return { response: "", error: lastError };
}
