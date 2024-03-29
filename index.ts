import http, { RequestOptions } from 'http';
import { Har } from 'har-format';
import {
  BandwidthLimitsResponse,
  BlacklistItem,
  NewHarPageArgs,
  ProxyList,
  SetBandwidthLimitArgs,
  SetBlacklistArgs,
  SetRetryCountArgs,
  SetRewriteArgs,
  SetTimeoutsArgs,
  SetWhitelistArgs,
  StartHarArgs,
  StartProxyArgs,
  WaitArgs,
} from './typings/proxy';

enum Method {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
}

export {
  BandwidthLimitsResponse,
  BlacklistItem,
  NewHarPageArgs,
  ProxyList,
  SetBandwidthLimitArgs,
  SetBlacklistArgs,
  SetRetryCountArgs,
  SetRewriteArgs,
  SetTimeoutsArgs,
  SetWhitelistArgs,
  StartHarArgs,
  StartProxyArgs,
  WaitArgs,
};

export default class BrowserMobProxyAPIClient {
  readonly host;

  readonly port;

  constructor(host = 'localhost', port = 8080) {
    this.host = host;
    this.port = port;
  }

  protected httpRequest(
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
            resolve(data.join(''));
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
  ): Promise<string> {
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

  /***
   * Get a list of ports attached to ProxyServer instances managed by ProxyManager
   */
  async getProxyList(): Promise<ProxyList> {
    return JSON.parse(await this.httpRequestWithArgs('/proxy', Method.GET));
  }

  /**
   * Creates a new proxy to run requests off of
   */
  async start(args: StartProxyArgs = {}): Promise<number | null> {
    const res = await this.httpRequestWithArgs(
      '/proxy',
      Method.POST,
      { ...args },
    );
    const { port } = JSON.parse(res);
    return port || null;
  }

  /**
   * Shuts down the proxy and closes the port.
   */
  async stop(port: number): Promise<void> {
    await this.httpRequestWithArgs(`/proxy/${port}`, Method.DELETE);
  }

  /**
   * Creates a new HAR attached to the proxy
   * returns the HAR content if there was a previous HAR
   */
  async startHar(port: number, args: StartHarArgs = {}): Promise<Har | undefined> {
    const res = await this.httpRequestWithArgs(`/proxy/${port}/har`, Method.PUT, { ...args });
    return res ? JSON.parse(res) : undefined;
  }

  /**
   * Starts a new page on the existing HAR
   */
  async newHarPage(port: number, args: NewHarPageArgs = {}): Promise<void> {
    await this.httpRequestWithArgs(`/proxy/${port}/har/pageRef`, Method.PUT, { ...args });
  }

  /**
   * Returns the JSON/HAR content representing all the HTTP traffic passed through the proxy
   * provided you have already created the HAR with this.startHar
   */
  async getHar(port: number): Promise<Har | undefined> {
    const res = await this.httpRequestWithArgs(`/proxy/${port}/har`, Method.GET);
    return res ? JSON.parse(res) : undefined;
  }

  /**
   * Get whitelisted items
   */
  async getWhitelist(port: number): Promise<string[]> {
    return JSON.parse(await this.httpRequestWithArgs(`/proxy/${port}/whitelist`, Method.GET));
  }

  /**
   * Sets a list of URL patterns to whitelist
   */
  async setWhitelist(port: number, args: SetWhitelistArgs): Promise<void> {
    await this.httpRequestWithArgs(`/proxy/${port}/whitelist`, Method.PUT, { ...args });
  }

  /**
   * Clears all URL patterns from the whitelist
   */
  async clearWhitelist(port: number): Promise<void> {
    await this.httpRequestWithArgs(`/proxy/${port}/whitelist`, Method.DELETE);
  }

  /**
   * Get blacklisted items
   */
  async getBlacklist(port: number): Promise<BlacklistItem[]> {
    return JSON.parse(await this.httpRequestWithArgs(`/proxy/${port}/blacklist`, Method.GET));
  }

  /**
   * Set a URL to blacklist
   */
  async setBlacklist(port: number, args: SetBlacklistArgs): Promise<void> {
    await this.httpRequestWithArgs(`/proxy/${port}/blacklist`, Method.PUT, { ...args });
  }

  /**
   * Clears all URL patterns from the blacklist
   */
  async clearBlacklist(port: number): Promise<void> {
    await this.httpRequestWithArgs(`/proxy/${port}/blacklist`, Method.DELETE);
  }

  /**
   * Limit the bandwidth through the proxy
   */
  async setBandwidthLimit(port: number, args: SetBandwidthLimitArgs = {}): Promise<void> {
    await this.httpRequestWithArgs(`/proxy/${port}/limit`, Method.PUT, { ...args });
  }

  /**
   * Displays the amount of data remaining to be uploaded/downloaded until the limit is reached
   */
  async getBandwidthLimit(port: number): Promise<BandwidthLimitsResponse> {
    return JSON.parse(await this.httpRequestWithArgs(`/proxy/${port}/limit`, Method.GET));
  }

  /**
   * Set and override HTTP Request headers
   * Key is a header name (such as "User-Agent") and value is a value of HTTP header (such as "BrowserMob-Agent")
   */
  async setRequestHeaders(port: number, headers: Record<string, string>): Promise<void> {
    await this.httpRequest(
      {
        path: `/proxy/${port}/headers`,
        method: Method.POST,
        headers: {
          'Content-Type': 'text/plain',
        },
      },
      JSON.stringify(headers),
    );
  }

  /**
   * Overrides normal DNS lookups and remaps the given hosts with the associated IP address
   * Key is a host name (such as "example.com") and value is the IP address (such as "1.2.3.4")
   */
  async setHosts(port: number, hosts: Record<string, string>): Promise<void> {
    await this.httpRequest(
      {
        path: `/proxy/${port}/hosts`,
        method: Method.POST,
        headers: {
          'Content-Type': 'text/plain',
        },
      },
      JSON.stringify(hosts),
    );
  }

  /**
   * Set username and passwords to be sent for requests on a specific domain that are protected by Basic Authentication
   */
  async setBasicAuth(port: number, domain: string, username: string, password: string): Promise<void> {
    await this.httpRequest(
      {
        path: `/proxy/${port}/auth/basic/${domain}`,
        method: Method.POST,
        headers: {
          'Content-Type': 'text/plain',
        },
      },
      JSON.stringify({ username, password }),
    );
  }

  /**
   * Wait till all request are being made
   */
  async wait(port: number, args: WaitArgs): Promise<unknown> {
    return this.httpRequestWithArgs(`/proxy/${port}/wait`, Method.PUT, { ...args });
  }

  /**
   * Handles different proxy timeouts
   */
  async setTimeouts(port: number, timeouts: SetTimeoutsArgs): Promise<void> {
    await this.httpRequest(
      {
        path: `/proxy/${port}/timeout`,
        method: Method.PUT,
        headers: {
          'Content-Type': 'text/plain',
        },
      },
      JSON.stringify(timeouts),
    );
  }

  /**
   * Redirecting URLs
   */
  async setRewrite(port: number, args: SetRewriteArgs): Promise<void> {
    await this.httpRequestWithArgs(`/proxy/${port}/rewrite`, Method.PUT, { ...args });
  }

  /**
   * Removes all URL redirection rules currently in effect
   */
  async clearRewrites(port: number): Promise<void> {
    await this.httpRequestWithArgs(`/proxy/${port}/rewrite`, Method.DELETE);
  }

  /**
   * Set retry count
   */
  async setRetryCount(port: number, args: SetRetryCountArgs): Promise<void> {
    await this.httpRequestWithArgs(`/proxy/${port}/retry`, Method.PUT, { ...args });
  }

  /**
   * Empties the DNS cache
   */
  async clearDNSCache(port: number): Promise<void> {
    await this.httpRequestWithArgs(`/proxy/${port}/dns/cache`, Method.DELETE);
  }

  /**
   * Set request interceptor
   * example:  await proxy.setRequestInterceptor(port, "request.headers().remove('User-Agent'); request.headers().add('User-Agent', 'My-Custom-User-Agent-String 1.0');");
   * @see https://github.com/lightbody/browsermob-proxy#rest-api-interceptors-with-littleproxy
   */
  async setRequestInterceptor(port: number, interceptor: string): Promise<void> {
    await this.httpRequest(
      {
        path: `/proxy/${port}/filter/request`,
        method: Method.POST,
        headers: {
          'Content-Type': 'text/plain',
        },
      },
      interceptor,
    );
  }

  /**
   * Set response interceptor
   * example: await proxy.setResponseInterceptor(port, "response.headers().remove('User-Agent'); response.headers().add('User-Agent', 'My-Custom-User-Agent-String 1.0');");
   * @see https://github.com/lightbody/browsermob-proxy#rest-api-interceptors-with-littleproxy
   */
  async setResponseInterceptor(port: number, interceptor: string): Promise<void> {
    await this.httpRequest(
      {
        path: `/proxy/${port}/filter/response`,
        method: Method.POST,
        headers: {
          'Content-Type': 'text/plain',
        },
      },
      interceptor,
    );
  }
}
