import { afterAll, beforeAll, describe, expect, test } from '@jest/globals';
import {
  INVALID_PORT_FOR_TEST,
  PROXY_API_HOST,
  PROXY_API_PORT,
  proxyRequest,
  TEST_SERVER_HOST_FOR_PROXY,
  TEST_SERVER_PORT,
} from './global.server';
import BrowserMobProxyAPIClient from '../index';
import BMPError from '../BMPError';

const API = new BrowserMobProxyAPIClient(PROXY_API_HOST, PROXY_API_PORT);
let port: number;

const blacklistMatch = `http://${TEST_SERVER_HOST_FOR_PROXY}:${TEST_SERVER_PORT}/cookie`;

beforeAll(async () => {
  const p = await API.start();
  if (p) {
    port = p;
  }
});
afterAll(async () => {
  await API.stop(port);
});

describe('blacklist', () => {
  test('should have valid proxy port', async () => {
    expect(port).toBeGreaterThan(0);
  });

  test('should throw error for invalid port', async () => {
    await expect(API.getBlacklist(INVALID_PORT_FOR_TEST))
      .rejects
      .toThrow(BMPError);
  });

  test('should have empty blacklist by default', async () => {
    const blacklist = await API.getBlacklist(port);
    expect(blacklist).toEqual([]);
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

  test('should set blacklist', async () => {
    await API.setBlacklist(port, {
      regex: blacklistMatch,
      status: 418,
      method: 'GET',
    });
  });

  test('should get blacklist', async () => {
    const blacklist = await API.getBlacklist(port);
    expect(blacklist).toEqual([
      expect.objectContaining({
        httpMethodPattern: 'GET',
        method: 'GET',
        pattern: blacklistMatch,
        responseCode: 418,
        statusCode: 418,
        urlPattern: blacklistMatch,
      }),
    ]);
  });

  test('blacklisted http requests should be blocked', async () => {
    const request = await proxyRequest({
      port: port,
      path: '/cookie',
    });
    expect(request.res.statusCode).toBe(418);
  });

  test('POST method should not be blocked', async () => {
    const request = await proxyRequest({
      port: port,
      method: 'POST',
      path: '/cookie',
    });
    expect(request.res.statusCode).toBe(200);
  });

  test('non blacklisted http requests should return 200', async () => {
    const request = await proxyRequest({
      port: port,
      path: '/',
    });
    expect(request.res.statusCode).toBe(200);
  });

  test('should clear blacklist', async () => {
    await API.clearBlacklist(port);
  });

  test('should be empty blacklist', async () => {
    const blacklist = await API.getBlacklist(port);
    expect(blacklist).toEqual([]);
  });
});

