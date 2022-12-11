import http from 'http';

export default class BMPClient {
  readonly host;

  readonly port;

  constructor(host = 'localhost', port = 8080) {
    this.host = host;
    this.port = port;
  }

  private httpRequest(
    path = '/',
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    args: Record<string, string | number | boolean> = {},
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const hasPostData = ['POST', 'PUT'].includes(method) && Object.entries(args).length;

      const headers: Record<string, string> = {};
      if (hasPostData) {
        headers['Content-Type'] = 'application/x-www-form-urlencoded';
      }

      const req = http.request({
        path,
        method,
        host: this.host,
        port: this.port,
        headers,
      },
      res => {
        const data: string[] = [];
        res.on('data', chunk => data.push(chunk));
        res.on('end', () => {
          resolve(data.join());
        });
      });
      req.on('error', error => reject(error));

      if (hasPostData) {
        const params = new URLSearchParams();
        Object.entries(args).forEach(arg => params.set(arg[0], String(arg[1])));
        req.write(params.toString());
      }

      req.end();
    });
  }

  async getProxyList() {
    return JSON.parse(await this.httpRequest('/proxy', 'GET'));
  }

}
