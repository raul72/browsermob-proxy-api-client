import http, { ClientRequest, IncomingMessage, RequestOptions } from 'http';

export enum Method {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
}

export interface HttpRequestResponse {
  req: ClientRequest;
  res: IncomingMessage;
  data: string;
}

export default class HttpRequest {
  protected httpRequest(
    options: RequestOptions,
    payload = '',
  ): Promise<HttpRequestResponse> {
    return new Promise((resolve, reject) => {
      const req = http.request(
        {
          ...options,
        },
        res => {
          const data: string[] = [];
          res.on('data', chunk => data.push(chunk));
          res.on('end', () => {
            resolve({
              req,
              res,
              data: data.join(''),
            });
          });
        });

      req.on('error', error => reject(error));

      if (payload) {
        req.write(payload);
      }

      req.end();
    });
  }

  protected httpRequestWithArgs(
    path = '/',
    method: Method = Method.GET,
    args: Record<string, string | number | boolean> = {},
  ): Promise<HttpRequestResponse> {
    const headers: Record<string, string> = {};
    const params = new URLSearchParams();

    if ([Method.POST, Method.PUT].includes(method) && Object.entries(args).length) {
      headers['Content-Type'] = 'application/x-www-form-urlencoded';
      Object.entries(args).forEach(arg => params.set(arg[0], String(arg[1])));
    }

    return this.httpRequest(
      {
        path,
        method,
        headers,
      },
      params.toString(),
    );
  }
}
