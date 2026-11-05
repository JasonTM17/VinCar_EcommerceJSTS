import { ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LongCatClient } from './longcat.client';

describe('LongCatClient', () => {
  const supported = { categories: ['SUV'], powertrains: ['Electric'] };
  const config = (apiKey?: string) => ({ get: () => apiKey }) as unknown as ConfigService;

  afterEach(() => jest.restoreAllMocks());

  it('uses the server key, bounded model request, and accepts plain-text completion output', async () => {
    const fetch = jest.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(
      JSON.stringify({ choices: [{ message: { content: '{"maxBudgetVnd":1200000000}' } }] }),
      { status: 200 },
    ));
    const client = new LongCatClient(config('server-secret'));

    await expect(client.extractPreferences('xe gia dinh duoi 1.2 ty', supported))
      .resolves.toBe('{"maxBudgetVnd":1200000000}');

    expect(fetch).toHaveBeenCalledTimes(1);
    const request = JSON.parse(String(fetch.mock.calls[0][1]?.body));
    expect(fetch.mock.calls[0][0]).toBe('https://api.longcat.chat/openai/v1/chat/completions');
    expect(request.model).toBe('LongCat-2.5');
    expect(request.max_tokens).toBe(160);
    expect(request.messages[0].content).toContain('["SUV"]');
    expect(request.messages[0].content).toContain('["Electric"]');
    expect(request.messages[1].content).toBe('xe gia dinh duoi 1.2 ty');
    expect(fetch.mock.calls[0][1]?.headers).toEqual({
      Authorization: 'Bearer server-secret',
      'Content-Type': 'application/json',
    });
  });

  it('fails generically when the server key is missing', async () => {
    const fetch = jest.spyOn(globalThis, 'fetch');
    const client = new LongCatClient(config(undefined));

    await expect(client.extractPreferences('SUV', supported)).rejects.toThrow(ServiceUnavailableException);
    expect(fetch).not.toHaveBeenCalled();
  });

  it.each([
    new Response('provider secret body', { status: 503 }),
    new Response('{invalid json', { status: 200 }),
    new Response(JSON.stringify({ choices: [{ message: { content: 123 } }] }), { status: 200 }),
    new Response(JSON.stringify({ choices: [{ message: { content: 'x'.repeat(4_097) } }] }), { status: 200 }),
    new Response('x'.repeat(20_000), { status: 200 }),
  ])('hides upstream errors and malformed or excessive output', async (response) => {
    jest.spyOn(globalThis, 'fetch').mockResolvedValue(response);
    const client = new LongCatClient(config('server-secret'));

    await expect(client.extractPreferences('SUV', supported)).rejects.toThrow(
      'Vehicle recommendations are temporarily unavailable.',
    );
  });

  it('uses the bounded timeout and maps an abort to a generic error', async () => {
    const timeout = jest.spyOn(AbortSignal, 'timeout').mockReturnValue(AbortSignal.abort());
    const fetch = jest.spyOn(globalThis, 'fetch').mockRejectedValue(new DOMException('aborted', 'AbortError'));
    const client = new LongCatClient(config('server-secret'));

    await expect(client.extractPreferences('SUV', supported)).rejects.toThrow(
      'Vehicle recommendations are temporarily unavailable.',
    );
    expect(timeout).toHaveBeenCalledWith(8_000);
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});
