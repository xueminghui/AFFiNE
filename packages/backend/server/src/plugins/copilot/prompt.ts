import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

import { ChatMessage } from './types';

@Injectable()
export class CopilotPromptService {
  constructor(private readonly db: PrismaClient) {}

  // list prompt names
  async list() {
    return this.db.aiPrompt
      .findMany({ select: { name: true } })
      .then(prompts => Array.from(new Set(prompts.map(p => p.name))));
  }

  async get(name: string): Promise<ChatMessage[]> {
    return this.db.aiPrompt.findMany({
      where: {
        name,
      },
      select: {
        role: true,
        content: true,
      },
      orderBy: {
        idx: 'asc',
      },
    });
  }

  async set(name: string, messages: ChatMessage[]) {
    return this.db.$transaction(async tx => {
      const prompts = await tx.aiPrompt.count({ where: { name } });
      if (prompts > 0) {
        return 0;
      }
      return tx.aiPrompt
        .createMany({
          data: messages.map((m, idx) => ({ name, idx, ...m })),
        })
        .then(ret => ret.count);
    });
  }

  async delete(name: string) {
    return this.db.aiPrompt
      .deleteMany({
        where: { name },
      })
      .then(ret => ret.count);
  }
}
