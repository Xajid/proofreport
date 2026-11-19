import type { NarrativeInput, NarrativeResult } from "@/types/metrics";
import { generateTemplateNarrative } from "./template";
import { generateOpenAINarrative } from "./openai";

export interface NarrativeProvider {
  generate(input: NarrativeInput): Promise<NarrativeResult>;
}

export const narrativeProvider: NarrativeProvider = {
  async generate(input) {
    return generateOpenAINarrative(input);
  },
};

export { generateTemplateNarrative, generateOpenAINarrative };
