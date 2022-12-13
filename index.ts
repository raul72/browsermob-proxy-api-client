import http, { RequestOptions } from 'http';
import { ProxyList } from './typings/proxy';

enum Method {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
}

export default class BMPClient {
  readonly host;

  readonly port;

  constructor(host = 'localhost', port = 8080) {
    this.host = host;
    this.port = port;
  }

  private httpRequest(
    options: RequestOptions,
    payload = '',
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const req = http.request(
        {
          host: this.host,
          port: this.port,
          ...options,
        },
        res => {
          const data: string[] = [];
          res.on('data', chunk => data.push(chunk));
          res.on('end', () => {
            resolve(data.join());
          });
        });

      req.on('error', error => reject(error));

      if (payload) {
        req.write(payload);
      }

      req.end();
    });
  }

  private httpRequestWithArgs(
    path = '/',
    method: Method = Method.GET,
    args: Record<string, string | number | boolean> = {},
  ): Promise<string> {
    const headers: Record<string, string> = {};
    let postData = '';

    if ([Method.POST, Method.PUT].includes(method) && Object.entries(args).length) {
      headers['Content-Type'] = 'application/x-www-form-urlencoded';
      const params = new URLSearchParams();
      Object.entries(args).forEach(arg => params.set(arg[0], String(arg[1])));
      postData = params.toString();
    }

    return this.httpRequest(
      {
        path,
        method,
        headers,
      },
      postData,
    );
  }

  /***
   * Get a list of ports attached to ProxyServer instances managed by ProxyManager
   */
  async getProxyList(): Promise<ProxyList> {
    return JSON.parse(await this.httpRequestWithArgs('/proxy', Method.GET));
  }

}
