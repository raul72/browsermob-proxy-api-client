import { describe, expect, test } from '@jest/globals';
import { INVALID_PORT_FOR_TEST, PROXY_API_HOST, PROXY_API_PORT } from './global.server';
import BrowserMobProxyAPIClient from '../index';
import BMPError from '../BMPError';

describe('getProxyList', () => {
  test('getProxyList', async () => {
    const API = new BrowserMobProxyAPIClient(PROXY_API_HOST, PROXY_API_PORT);

    const listBefore = (await API.getProxyList()).proxyList.map(item => item.port);

    const port = await API.start();

    expect(port).toBeGreaterThan(0);

    const listAfterStart = (await API.getProxyList()).proxyList.map(item => item.port);

    await API.stop(Number(port));

    const listAfterStop = (await API.getProxyList()).proxyList.map(item => item.port);

    expect(listBefore).toEqual(
      expect.not.arrayContaining([port]),
    );
    expect(listAfterStart).toEqual(
      expect.arrayContaining([port]),
    );
    expect(listAfterStop).toEqual(
      expect.not.arrayContaining([port]),
    );

  });

  test('API.stop should throw error for invalid port', async () => {
    const API = new BrowserMobProxyAPIClient(PROXY_API_HOST, PROXY_API_PORT);

    await expect(API.stop(INVALID_PORT_FOR_TEST))
      .rejects
      .toThrow(BMPError);
  });
});
