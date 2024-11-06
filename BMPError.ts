import { ClientRequest, IncomingMessage } from 'http';
import { OutgoingHttpHeaders } from 'http2';

import { HttpRequestResponse } from './httpRequest';

interface BMPErrorRequest extends Pick<ClientRequest, 'host' | 'protocol' | 'method' | 'path'> {
  headers: OutgoingHttpHeaders;
}

interface BMPErrorResponse
  extends Pick<IncomingMessage, 'complete' | 'headers' | 'rawHeaders' | 'method' | 'url' | 'statusCode' | 'statusMessage'> {
}

export default class BMPError extends Error {
  public req: BMPErrorRequest;

  public res: BMPErrorResponse;

  public data;

  public constructor(message: string, { req, res, data }: HttpRequestResponse) {
    super(message);

    this.req = {
      host: req.host,
      protocol: req.protocol,
      method: req.method,
      path: req.path,
      headers: req.getHeaders(),
    };

    this.res = {
      complete: res.complete,
      headers: res.headers,
      rawHeaders: res.rawHeaders,
      method: res.method,
      url: res.url,
      statusCode: res.statusCode,
      statusMessage: res.statusMessage,
    };

    this.data = data;
  }
}
