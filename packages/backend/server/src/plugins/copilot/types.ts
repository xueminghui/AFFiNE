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

export enum CopilotProviderCapability {
  TextToText = 'text-to-text',
  TextToEmbedding = 'text-to-embedding',
  TextToImage = 'text-to-image',
  ImageToImage = 'image-to-image',
}

export interface CopilotProvider {
  getCapabilities(): CopilotProviderCapability[];
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
  generateText(messages: ChatMessage[], model: string): Promise<string>;
  generateTextStream(
    messages: ChatMessage[],
    model: string
  ): AsyncIterable<string>;
}

export interface CopilotTextToEmbeddingProvider extends CopilotProvider {}

export interface CopilotTextToImageProvider extends CopilotProvider {}

export interface CopilotImageToImageProvider extends CopilotProvider {}

export type CapabilityToCopilotProvider = {
  [CopilotProviderCapability.TextToText]: CopilotTextToTextProvider;
  [CopilotProviderCapability.TextToEmbedding]: CopilotTextToEmbeddingProvider;
  [CopilotProviderCapability.TextToImage]: CopilotTextToImageProvider;
  [CopilotProviderCapability.ImageToImage]: CopilotImageToImageProvider;
};
