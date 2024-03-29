import { AiPromptRole } from '@prisma/client';
import type { ClientOptions as OpenAIClientOptions } from 'openai';
import { z } from 'zod';

export interface CopilotConfig {
  openai: OpenAIClientOptions;
  fal: {
    secret: string;
  };
}

export enum CopilotProviderType {
  FAL = 'fal',
  OpenAI = 'openai',
}

export enum CopilotCapability {
  TextToText = 'text-to-text',
  TextToEmbedding = 'text-to-embedding',
  TextToImage = 'text-to-image',
  ImageToImage = 'image-to-image',
}

export interface CopilotProvider {
  getCapabilities(): CopilotCapability[];
}

export const ChatMessageSchema = z
  .object({
    role: z.enum(
      Array.from(Object.values(AiPromptRole)) as [
        'system' | 'assistant' | 'user',
      ]
    ),
    content: z.string(),
  })
  .strict();

export type ChatMessage = z.infer<typeof ChatMessageSchema>;

export interface CopilotTextToTextProvider extends CopilotProvider {
  generateText(
    messages: ChatMessage[],
    model: string,
    options: {
      temperature?: number;
      maxTokens?: number;
      signal?: AbortSignal;
      user?: string;
    }
  ): Promise<string>;
  generateTextStream(
    messages: ChatMessage[],
    model: string,
    options: {
      temperature?: number;
      maxTokens?: number;
      signal?: AbortSignal;
      user?: string;
    }
  ): AsyncIterable<string>;
}

export interface CopilotTextToEmbeddingProvider extends CopilotProvider {
  generateEmbedding(
    messages: string[] | string,
    model: string,
    options: {
      dimensions: number;
      signal?: AbortSignal;
      user?: string;
    }
  ): Promise<number[][]>;
}

export interface CopilotTextToImageProvider extends CopilotProvider {}

export interface CopilotImageToImageProvider extends CopilotProvider {}

export type CapabilityToCopilotProvider = {
  [CopilotCapability.TextToText]: CopilotTextToTextProvider;
  [CopilotCapability.TextToEmbedding]: CopilotTextToEmbeddingProvider;
  [CopilotCapability.TextToImage]: CopilotTextToImageProvider;
  [CopilotCapability.ImageToImage]: CopilotImageToImageProvider;
};
