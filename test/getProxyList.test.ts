import { describe, expect, test } from '@jest/globals';
import { PROXY_API_HOST, PROXY_API_PORT } from './global.server';
import BrowserMobProxyAPIClient from '../index';

describe('getProxyList', () => {
  test('getProxyList', async () => {
    const API = new BrowserMobProxyAPIClient(PROXY_API_HOST, PROXY_API_PORT);
    const port = await API.start();

    expect(port).toBeGreaterThan(0);

    const list = await API.getProxyList();

    expect(list).toMatchObject({
      proxyList: expect.arrayContaining([
        expect.objectContaining({ port }),
      ]),
    });

    await API.stop(Number(port));
  });
});
