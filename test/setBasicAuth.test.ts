import { describe, expect, test } from '@jest/globals';
import { INVALID_PORT_FOR_TEST, PROXY_API_HOST, PROXY_API_PORT, proxyRequest, TEST_SERVER_HOST_FOR_PROXY } from './global.server';
import BrowserMobProxyAPIClient from '../index';
import BMPError from '../BMPError';

describe('setBasicAuth', () => {
  test('should throw error for invalid port', async () => {
    const API = new BrowserMobProxyAPIClient(PROXY_API_HOST, PROXY_API_PORT);

    await expect(API.setBasicAuth(INVALID_PORT_FOR_TEST, TEST_SERVER_HOST_FOR_PROXY, 'user', 'test'))
      .rejects
      .toThrow(BMPError);
  });

  test('setBasicAuth', async () => {
    const API = new BrowserMobProxyAPIClient(PROXY_API_HOST, PROXY_API_PORT);
    const port = await API.start();

    expect(port).toBeGreaterThan(0);

    try {
      const before = await proxyRequest({
        port: Number(port),
        path: '/auth',
      });

      expect(before.res.statusCode).toBe(401);

      before.req.destroy();

      await API.setBasicAuth(Number(port), TEST_SERVER_HOST_FOR_PROXY, 'user', 'test');

      const after = await proxyRequest({
        port: Number(port),
        path: '/auth',
      });

      expect(after.res.statusCode).toBe(200);

      after.req.destroy();
    } catch (e) {
      throw e;
    } finally {
      await API.stop(Number(port));
    }
  });
});
