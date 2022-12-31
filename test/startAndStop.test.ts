import { describe, expect, test } from '@jest/globals';
import { PROXY_API_HOST, PROXY_API_PORT } from './global.server';
import BrowserMobProxyAPIClient from '../index';

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
});
