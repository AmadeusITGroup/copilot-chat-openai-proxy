import customHandlers from "./custom";

import { ChatCommandHandler } from "./chatCommandHandler";

export const intentHandlers: Map<string, ChatCommandHandler> = new Map();

export function registerIntentHandlers(): Map<string, ChatCommandHandler> {
  customHandlers.forEach((handler: ChatCommandHandler) => {
    intentHandlers.set(handler.name, handler);
  });
  return intentHandlers;
}
