import { afterAll, beforeAll, describe, expect, test } from '@jest/globals';
import {
  PROXY_API_HOST,
  PROXY_API_PORT,
  proxyRequest,
  TEST_SERVER_HOST_FOR_PROXY,
  TEST_SERVER_PORT,
} from './global.server';
import BrowserMobProxyAPIClient from '../index';

const API = new BrowserMobProxyAPIClient(PROXY_API_HOST, PROXY_API_PORT);
let port: number;

const whitelistMatch = `http://${TEST_SERVER_HOST_FOR_PROXY}:${TEST_SERVER_PORT}/cookie`;

beforeAll(async () => {
  const p = await API.start();
  if (p) {
    port = p;
  }
});
afterAll(async () => {
  await API.stop(port);
});

describe('whitelist', () => {
  test('should have valid proxy port', async () => {
    expect(port).toBeGreaterThan(0);
  });

  test('should have empty whitelist by default', async () => {
    const whitelist = await API.getWhitelist(port);
    expect(whitelist).toEqual([]);
  });

  test('http requests should return 200', async () => {
    const request1 = await proxyRequest({
      port: port,
      path: '/',
    });
    expect(request1.res.statusCode).toBe(200);

    const request2 = await proxyRequest({
      port: port,
      path: '/cookie',
    });
    expect(request2.res.statusCode).toBe(200);
  });

  test('should set whitelist', async () => {
    await API.setWhitelist(port, {
      regex: whitelistMatch,
      status: 418,
    });
  });

  test('should get whitelist', async () => {
    const whitelist = await API.getWhitelist(port);
    expect(whitelist).toEqual([ whitelistMatch ]);
  });

  test('whitelisted http requests should return 200', async () => {
    const request = await proxyRequest({
      port: port,
      path: '/cookie',
    });
    expect(request.res.statusCode).toBe(200);
  });

  test('non whitelisted http requests should not return 200', async () => {
    const request = await proxyRequest({
      port: port,
      path: '/',
    });
    expect(request.res.statusCode).toBe(418);
  });

  test('should clear whitelist', async () => {
    await API.clearWhitelist(port);
  });

  test('should be empty whitelist', async () => {
    const whitelist = await API.getWhitelist(port);
    expect(whitelist).toEqual([]);
  });
});

