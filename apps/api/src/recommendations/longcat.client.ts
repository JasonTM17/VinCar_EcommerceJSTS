import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupportedVehicleFilters } from './preferences';

const LONGCAT_ENDPOINT = 'https://api.longcat.chat/openai/v1/chat/completions';
const LONGCAT_MODEL = 'LongCat-2.5';
const PROVIDER_TIMEOUT_MS = 8_000;
const MAX_PROVIDER_RESPONSE_BYTES = 16_384;
const MAX_EXTRACTION_LENGTH = 4_096;
const UNAVAILABLE_MESSAGE = 'Vehicle recommendations are temporarily unavailable.';

@Injectable()
export class LongCatClient {
  constructor(private readonly config: ConfigService) {}

  async extractPreferences(
    need: string,
    supported: SupportedVehicleFilters,
  ): Promise<string> {
    const apiKey = this.config.get<string>('LONGCAT_API_KEY');
    if (!apiKey?.trim()) throw new ServiceUnavailableException(UNAVAILABLE_MESSAGE);

    try {
      const response = await fetch(LONGCAT_ENDPOINT, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: LONGCAT_MODEL,
          max_tokens: 160,
          stream: false,
          messages: [
            {
              role: 'system',
              content: [
                'Extract only explicit vehicle-shopping preferences from the user message.',
                'Return exactly one JSON object and no markdown or surrounding prose.',
                'Allowed optional keys: maxBudgetVnd (positive integer VND, trim base-price ceiling), minRangeKm (positive integer), minSeats (positive integer), category (exact member of allowed categories), powertrain (exact member of allowed powertrains).',
                'Omit keys the user did not clearly request. Do not add any other keys, explanations, vehicle names, prices, ranges, or specifications.',
                `Allowed categories: ${JSON.stringify(supported.categories)}.`,
                `Allowed powertrains: ${JSON.stringify(supported.powertrains)}.`,
              ].join(' '),
            },
            { role: 'user', content: need },
          ],
        }),
        signal: AbortSignal.timeout(PROVIDER_TIMEOUT_MS),
      });

      if (!response.ok) throw new Error('Provider request failed');
      const payload = await readJsonLimited(response);
      const content = getMessageContent(payload);
      if (content.length > MAX_EXTRACTION_LENGTH) throw new Error('Provider response exceeded limit');
      return content;
    } catch {
      throw new ServiceUnavailableException(UNAVAILABLE_MESSAGE);
    }
  }
}

async function readJsonLimited(response: Response): Promise<unknown> {
  if (!response.body) throw new Error('Provider response had no body');
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      totalBytes += value.byteLength;
      if (totalBytes > MAX_PROVIDER_RESPONSE_BYTES) {
        await reader.cancel();
        throw new Error('Provider response exceeded limit');
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  const bytes = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return JSON.parse(new TextDecoder().decode(bytes)) as unknown;
}

function getMessageContent(payload: unknown): string {
  if (!isRecord(payload) || !Array.isArray(payload['choices'])) throw new Error('Malformed provider response');
  const firstChoice: unknown = payload['choices'][0];
  if (!isRecord(firstChoice) || !isRecord(firstChoice['message'])) throw new Error('Malformed provider response');
  const content = firstChoice['message']['content'];
  if (typeof content !== 'string') throw new Error('Malformed provider response');
  return content;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
