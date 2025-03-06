import http, { RequestOptions } from 'http';
import HttpRequest, { HttpRequestResponse } from '../httpRequest';

const env = process.env;

// port where unit tests HTTP server is running
export const TEST_SERVER_PORT = Number(env.TEST_SERVER_PORT) || 9000;
// hostname how proxy server sees unit tests server
// if you are running tests in host machine and proxy in docker use "host.docker.internal"
// if you are running both in docker use hostname where unit tests server is running
export const TEST_SERVER_HOST_FOR_PROXY = env.TEST_SERVER_HOST_FOR_PROXY || 'host.docker.internal';
// hostname for proxy server
// if you are running tests in host machine and proxy in docker use "localhost"
// if you are running both in docker use hostname proxy is running
const PROXY_HOST = env.PROXY_HOST || 'localhost';

export const PROXY_API_HOST = env.PROXY_API_HOST || PROXY_HOST;
// BMP_PORT
export const PROXY_API_PORT = Number(env.PROXY_API_PORT) || 8080;

export const base64png = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAMSURBVBhXY/j//z8ABf4C/qc1gYQAAAAASUVORK5CYII=';

const server = http.createServer((req, res) => {
  if (req.url === '/') {
    res.writeHead(200, {
      'content-type': 'text/plain',
    });
    res.end('OK');
    return;
  }

  if (req.url === '/px.png') {
    res.writeHead(200, {
      'content-type': 'image/png',
    });
    res.end(Buffer.from(
      base64png,
      'base64',
    ).toString());
    return;
  }

  if (req.url === '/cookie') {
    res.writeHead(200, {
      'Set-Cookie': 'servercookie=servercookievalue',
    });
    res.statusCode = 200;
    res.end(JSON.stringify(req.headers.cookie));
    return;
  }

  if (req.url === '/auth') {
    const header = req.headers.authorization || '';
    const token = header.split(/\s+/).pop() || '';
    const auth = Buffer.from(token, 'base64').toString();
    const parts = auth.split(/:/);
    const username = parts.shift();
    const password = parts.join(':');

    if (username !== 'user' && password !== 'test') {
      res.statusCode = 401;
      res.end('Unauthorized');
    } else {
      res.statusCode = 200;
      res.end('OK');
    }
    return;
  }

  res.statusCode = 404;
  res.end('Not Found');
});


export const start = (): Promise<void> => new Promise(resolve => {
  server.listen({
    port: TEST_SERVER_PORT,
    host: '0.0.0.0',
  }, () => {
    console.log('HTTP Server running on port', TEST_SERVER_PORT);
    resolve();
  });
});

export const stop = (): void => {
  server.close();
};

class ProxyHttpRequest extends HttpRequest {
  public proxyRequest(options: RequestOptions, payload: string = ''): Promise<HttpRequestResponse> {
    return super.httpRequest(
      {
        host: PROXY_HOST,
        ...options,
        path: `http://${TEST_SERVER_HOST_FOR_PROXY}:${TEST_SERVER_PORT}${options.path}`,
      },
      payload,
    );
  }
}

const proxyClient = new ProxyHttpRequest();

export const proxyRequest = async (
  options: RequestOptions,
  payload = '',
): Promise<HttpRequestResponse> => {
  return proxyClient.proxyRequest(options, payload);
};

