import axios from "axios";

export type AzureOpenAIEmbeddingParams = {
  endpoint: string;
  apiKey: string;
  deploymentName: string;
  apiVersion: string;
};

export interface EmbeddingModel {
  getEmbedding(inputText: string): Promise<number[]>;
}

export class AzureOpenAIEmbeddingModel implements EmbeddingModel {
  private azureOpenAIEmbeddingParams: AzureOpenAIEmbeddingParams;

  constructor(azureOpenAIEmbeddingParams: AzureOpenAIEmbeddingParams) {
    this.azureOpenAIEmbeddingParams = azureOpenAIEmbeddingParams;
  }

  public async getEmbedding(inputText: string): Promise<number[]> {
    const url = `${this.azureOpenAIEmbeddingParams.endpoint}/openai/deployments/${this.azureOpenAIEmbeddingParams.deploymentName}/embeddings?api-version=${this.azureOpenAIEmbeddingParams.apiVersion}`;

    const headers = {
      "Content-Type": "application/json",
      "api-key": this.azureOpenAIEmbeddingParams.apiKey,
    };

    const data = {
      input: inputText, // The text input for which you need embeddings
    };

    try {
      const response = await axios.post(url, data, { headers });
      const embedding = response.data.data[0].embedding; // Embedding result
      return embedding;
    } catch (error: any) {
      error.message = error.response
        ? `Error tryting to embedd content: ${error.response.data.error.code} - ${error.response.data.error.message}`
        : error.message;
      throw error;
    }
  }
}
