import * as fs from "fs";

export type ChatInteractionData = {
  userQuery: string;
  contextsRetrieved: string[];
  llmResponse: string;
  modelName: string;
  timestamp: number;
};

export function saveChatInteractionData(
  filename: string,
  transactionData: any,
) {
  const jsonData = JSON.stringify(transactionData, null);

  fs.appendFile(filename, jsonData + "\n", (err) => {
    if (err) {
      console.error("Error writing to file", err);
    } else {
      console.log("Transaction data saved successfully");
    }
  });
}
