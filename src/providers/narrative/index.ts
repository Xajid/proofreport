import type { NarrativeInput, NarrativeResult } from "@/types/metrics";
import { generateTemplateNarrative } from "./template";
import { generateOpenAINarrative } from "./openai";

export interface NarrativeProvider {
  generate(input: NarrativeInput): Promise<NarrativeResult>;
}

export const narrativeProvider: NarrativeProvider = {
  async generate(input) {
    if (process.env.OPENAI_API_KEY) {
      return generateOpenAINarrative(input);
    }
    return generateTemplateNarrative(input);
  },
};

export { generateTemplateNarrative, generateOpenAINarrative };
