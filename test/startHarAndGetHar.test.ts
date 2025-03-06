import { describe, expect, test } from '@jest/globals';
import { INVALID_PORT_FOR_TEST, PROXY_API_HOST, PROXY_API_PORT, proxyRequest } from './global.server';
import BrowserMobProxyAPIClient from '../index';
import BMPError from '../BMPError';

describe('startHarAndGetHar', () => {
  test('starHar', async () => {
    const API = new BrowserMobProxyAPIClient(PROXY_API_HOST, PROXY_API_PORT);
    const port = Number(await API.start());

    expect(port).toBeGreaterThan(0);

    try {
      const startHarResponse = await API.startHar(port);

      expect(startHarResponse).toBeUndefined();

      const request = await proxyRequest({
        port: port,
        path: '/',
      });

      expect(request.res.statusCode).toBe(200);

      const getHarResponse = await API.getHar(port);

      expect(getHarResponse).toEqual(expect.objectContaining({
        log: expect.objectContaining({
          entries: expect.arrayContaining([
            expect.objectContaining({
              request: expect.objectContaining({ method: 'GET' }),
              response: expect.objectContaining({ status: 200 }),
            }),
          ]),
        }),
      }));

      const startHarAgainResponse = await API.getHar(port);

      expect(startHarAgainResponse).toEqual(expect.objectContaining({
        log: expect.objectContaining({
          entries: expect.arrayContaining([
            expect.objectContaining({
              request: expect.objectContaining({ method: 'GET' }),
              response: expect.objectContaining({ status: 200 }),
            }),
          ]),
        }),
      }));
    } catch (e) {
      throw e;
    } finally {
      await API.stop(Number(port));
    }
  });
  test('HAR not to contain headers by default', async () => {
    const API = new BrowserMobProxyAPIClient(PROXY_API_HOST, PROXY_API_PORT);
    const port = Number(await API.start());

    expect(port).toBeGreaterThan(0);

    try {
      await API.startHar(port);

      const request = await proxyRequest({
        port: port,
        path: '/',
      });

      expect(request.res.statusCode).toBe(200);

      const getHarResponse = await API.getHar(port);

      expect(getHarResponse).toEqual(expect.objectContaining({
        log: expect.objectContaining({
          entries: expect.arrayContaining([
            expect.objectContaining({
              request: expect.objectContaining({ headers: [] }),
              response: expect.objectContaining({ headers: [] }),
            }),
          ]),
        }),
      }));
    } catch (e) {
      throw e;
    } finally {
      await API.stop(Number(port));
    }
  });
  test('HAR to to contain headers when requested', async () => {
    const API = new BrowserMobProxyAPIClient(PROXY_API_HOST, PROXY_API_PORT);
    const port = Number(await API.start());

    expect(port).toBeGreaterThan(0);

    try {
      await API.startHar(port, {
        captureHeaders: true,
      });

      const request = await proxyRequest({
        port: port,
        path: '/',
      });

      expect(request.res.statusCode).toBe(200);

      const getHarResponse = await API.getHar(port);

      expect(getHarResponse).toEqual(expect.objectContaining({
        log: expect.objectContaining({
          entries: expect.arrayContaining([
            expect.objectContaining({
              request: expect.objectContaining({
                headers: expect.arrayContaining([
                  expect.objectContaining({
                    name: expect.any(String),
                    value: expect.any(String),
                  }),
                ]),
              }),
              response: expect.objectContaining({
                headers: expect.arrayContaining([
                  expect.objectContaining({
                    name: expect.any(String),
                    value: expect.any(String),
                  }),
                ]),
              }),
            }),
          ]),
        }),
      }));
    } catch (e) {
      throw e;
    } finally {
      await API.stop(Number(port));
    }
  });

  test('HAR not to contain cookies by default', async () => {
    const API = new BrowserMobProxyAPIClient(PROXY_API_HOST, PROXY_API_PORT);
    const port = Number(await API.start());

    expect(port).toBeGreaterThan(0);

    try {
      await API.startHar(port);

      const request = await proxyRequest({
        port: port,
        path: '/cookie',
        headers: {
          'Cookie': 'clientcookie=clientcookievalue',
        },
      });

      expect(request.res.statusCode).toBe(200);

      const getHarResponse = await API.getHar(port);

      expect(getHarResponse).toEqual(expect.objectContaining({
        log: expect.objectContaining({
          entries: expect.arrayContaining([
            expect.objectContaining({
              request: expect.objectContaining({ cookies: [] }),
              response: expect.objectContaining({ cookies: [] }),
            }),
          ]),
        }),
      }));
    } catch (e) {
      throw e;
    } finally {
      await API.stop(Number(port));
    }
  });

  test('HAR to contain cookies when requested', async () => {
    const API = new BrowserMobProxyAPIClient(PROXY_API_HOST, PROXY_API_PORT);
    const port = Number(await API.start());

    expect(port).toBeGreaterThan(0);

    try {
      await API.startHar(port, {
        captureCookies: true,
      });

      const request = await proxyRequest({
        port: port,
        path: '/cookie',
        headers: {
          'Cookie': 'clientcookie=clientcookievalue',
        },
      });

      expect(request.res.statusCode).toEqual(200);

      const getHarResponse = await API.getHar(port);

      expect(getHarResponse).toEqual(expect.objectContaining({
        log: expect.objectContaining({
          entries: expect.arrayContaining([
            expect.objectContaining({
              request: expect.objectContaining({
                cookies: expect.arrayContaining([
                  expect.objectContaining({
                    name: 'clientcookie',
                    value: 'clientcookievalue',
                  }),
                ]),
              }),
              response: expect.objectContaining({
                cookies: expect.arrayContaining([
                  expect.objectContaining({
                    name: 'servercookie',
                    value: 'servercookievalue',
                  }),
                ]),
              }),
            }),
          ]),
        }),
      }));
    } catch (e) {
      throw e;
    } finally {
      await API.stop(Number(port));
    }
  });

  test('HAR not to contain content by defualt', async () => {
    const API = new BrowserMobProxyAPIClient(PROXY_API_HOST, PROXY_API_PORT);
    const port = Number(await API.start());

    expect(port).toBeGreaterThan(0);

    try {
      await API.startHar(port);

      const postPayload = 'This is the text sent via POST';

      const request = await proxyRequest(
        {
          method: 'POST',
          port: port,
          path: '/',
        },
        postPayload,
      );

      expect(request.res.statusCode).toBe(200);

      const getHarResponse = await API.getHar(port);

      expect(getHarResponse).toEqual(expect.objectContaining({
        log: expect.objectContaining({
          entries: expect.arrayContaining([
            expect.objectContaining({
              request: expect.not.objectContaining({
                postData: expect.anything(),
              }),
              response: expect.objectContaining({
                content: expect.not.objectContaining({
                  text: expect.any(String),
                }),
              }),
            }),
          ]),
        }),
      }));
    } catch (e) {
      throw e;
    } finally {
      await API.stop(Number(port));
    }
  });

  test('HAR to contain content when requested', async () => {
    const API = new BrowserMobProxyAPIClient(PROXY_API_HOST, PROXY_API_PORT);
    const port = Number(await API.start());

    expect(port).toBeGreaterThan(0);

    try {
      await API.startHar(port, {
        captureContent: true,
      });

      const postPayload = 'This is the text sent via POST';

      const request = await proxyRequest(
        {
          method: 'POST',
          port: port,
          path: '/',
        },
        postPayload,
      );

      expect(request.res.statusCode).toBe(200);

      const getHarResponse = await API.getHar(port);

      expect(getHarResponse).toEqual(expect.objectContaining({
        log: expect.objectContaining({
          entries: expect.arrayContaining([
            expect.objectContaining({
              request: expect.objectContaining({
                postData: expect.objectContaining({
                  text: postPayload,
                }),
              }),
              response: expect.objectContaining({
                content: expect.objectContaining({
                  text: 'OK',
                }),
              }),
            }),
          ]),
        }),
      }));
    } catch (e) {
      throw e;
    } finally {
      await API.stop(Number(port));
    }
  });

  test('HAR not to contain binary content by default', async () => {
    const API = new BrowserMobProxyAPIClient(PROXY_API_HOST, PROXY_API_PORT);
    const port = Number(await API.start());

    expect(port).toBeGreaterThan(0);

    try {
      await API.startHar(port, {
        captureContent: true,
      });

      const request = await proxyRequest(
        {
          method: 'POST',
          port: port,
          path: '/px.png',
        },
      );

      expect(request.res.statusCode).toBe(200);

      const getHarResponse = await API.getHar(port);

      expect(getHarResponse).toEqual(expect.objectContaining({
        log: expect.objectContaining({
          entries: expect.arrayContaining([
            expect.objectContaining({
              response: expect.objectContaining({
                content: expect.not.objectContaining({
                  text: expect.any(String),
                  encoding: expect.any(String),
                }),
              }),
            }),
          ]),
        }),
      }));
    } catch (e) {
      throw e;
    } finally {
      await API.stop(Number(port));
    }
  });

  test('HAR to contain binary content when requested', async () => {
    const API = new BrowserMobProxyAPIClient(PROXY_API_HOST, PROXY_API_PORT);
    const port = Number(await API.start());

    expect(port).toBeGreaterThan(0);

    try {
      await API.startHar(port, {
        captureContent: true,
        captureBinaryContent: true,
      });

      // TODO: try uploading a file and see if that is captured as well

      const request = await proxyRequest(
        {
          method: 'POST',
          port: port,
          path: '/px.png',
        },
      );

      expect(request.res.statusCode).toBe(200);

      const getHarResponse = await API.getHar(port);

      expect(getHarResponse).toEqual(expect.objectContaining({
        log: expect.objectContaining({
          entries: expect.arrayContaining([
            expect.objectContaining({
              response: expect.objectContaining({
                content: expect.objectContaining({
                  text: expect.any(String),
                  encoding: expect.any(String),
                }),
              }),
            }),
          ]),
        }),
      }));
    } catch (e) {
      throw e;
    } finally {
      await API.stop(Number(port));
    }
  });

  test('HAR to contain set initialPageRef', async () => {
    const API = new BrowserMobProxyAPIClient(PROXY_API_HOST, PROXY_API_PORT);
    const port = Number(await API.start());

    expect(port).toBeGreaterThan(0);

    try {
      const pageref = 'mah page ref';

      await API.startHar(port, {
        initialPageRef: pageref,
      });

      const request = await proxyRequest({
        port: port,
        path: '/',
      });

      expect(request.res.statusCode).toBe(200);

      const getHarResponse = await API.getHar(port);

      expect(getHarResponse).toEqual(expect.objectContaining({
        log: expect.objectContaining({
          entries: expect.arrayContaining([
            expect.objectContaining({
              pageref,
            }),
          ]),
          pages: expect.arrayContaining([
            expect.objectContaining({
              id: pageref,
            }),
          ]),
        }),
      }));
    } catch (e) {
      throw e;
    } finally {
      await API.stop(Number(port));
    }
  });

  test('HAR to contain set initialPageTitle', async () => {
    const API = new BrowserMobProxyAPIClient(PROXY_API_HOST, PROXY_API_PORT);
    const port = Number(await API.start());

    expect(port).toBeGreaterThan(0);

    try {
      const pageTitle = 'mah page title';

      await API.startHar(port, {
        initialPageTitle: pageTitle,
      });

      const request = await proxyRequest({
        port: port,
        path: '/',
      });

      expect(request.res.statusCode).toBe(200);

      const getHarResponse = await API.getHar(port);

      expect(getHarResponse).toEqual(expect.objectContaining({
        log: expect.objectContaining({
          pages: expect.arrayContaining([
            expect.objectContaining({
              title: pageTitle,
            }),
          ]),
        }),
      }));
    } catch (e) {
      throw e;
    } finally {
      await API.stop(Number(port));
    }
  });

  test('API.startHar should throw error for invalid port', async () => {
    const API = new BrowserMobProxyAPIClient(PROXY_API_HOST, PROXY_API_PORT);

    await expect(API.startHar(INVALID_PORT_FOR_TEST))
      .rejects
      .toThrow(BMPError);
  });

  test('API.getHar should throw error for invalid port', async () => {
    const API = new BrowserMobProxyAPIClient(PROXY_API_HOST, PROXY_API_PORT);

    await expect(API.getHar(INVALID_PORT_FOR_TEST))
      .rejects
      .toThrow(BMPError);
  });
});
