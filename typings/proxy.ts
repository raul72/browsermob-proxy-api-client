export interface ProxyListItem {
  port: number;
}

export interface ProxyList {
  proxyList: ProxyListItem[];
}

export interface StartProxyArgs {
  /**
   * The specific port to start the proxy service on.
   * Optional, default is generated and returned in response.
   */
  port?: number;
  /**
   * The username to use to authenticate with the chained proxy.
   * Optional, default to null.
   */
  proxyUsername?: string;
  /**
   * The password to use to authenticate with the chained proxy.
   * Optional, default to null.
    */
  proxyPassword?: string;
  /**
   * If running BrowserMob Proxy in a multi-homed environment,
   * specify a desired bind address. Optional, default to "0.0.0.0".
    */
  bindAddress?: string;
  /**
   * If running BrowserMob Proxy in a multi-homed environment,
   * specify a desired server bind address. Optional, default to "0.0.0.0".
    */
  serverBindAddress?: string;
  /**
   * Uses Elliptic Curve Cryptography for certificate impersonation.
   * Optional, default to "false".
    */
  useEcc?: boolean;
  /**
   * Disables verification of all upstream servers' SSL certificates.
   * All upstream servers will be trusted,
   * even if they do not present valid certificates
   * signed by certification authorities in the JDK's trust store.
   * Optional, default to "false".
    */
  trustAllServers?: boolean;
}

export interface StartHarArgs {
  /**
   * capture headers or not
   * Optional, default to "false".
   */
  captureHeaders?: boolean;
  /**
   * capture cookies or not
   * Optional, default to "false"
   */
  captureCookies?: boolean;
  /**
   * capture content bodies or not
   * Optional, default to "false"
   */
  captureContent?: boolean;
  /**
   * capture binary content or not
   * Optional, default to "false"
   */
  captureBinaryContent?: boolean;
  /**
   * The string name of The first page ref that should be used in the HAR.
   * Optional, default to "Page 1".
   */
  initialPageRef?: string;
  /**
   * The title of first HAR page. Optional, default to initialPageRef.
   */
  initialPageTitle?: string;
}

export interface NewHarPageArgs {
  /**
   * The string name of the first page ref that should be used in the HAR.
   * Optional, default to "Page N" where N is the next page number.
   */
  pageRef?: string;
  /**
   * The title of new HAR page.
   * Optional, default to pageRef.
   */
  pageTitle?: string;
}

export interface SetWhitelistArgs {
  /**
   * A comma separated list of regular expressions
   */
  regex: string;
  /**
   * The HTTP status code to return for URLs that do not match the whitelist.
   * Optional, default to 200
   */
  status?: number;
}

export interface SetBlacklistArgs {
  /**
   * The blacklist regular expression
   */
  regex: string;
  /**
   * The HTTP status code to return for URLs that are blacklisted
   */
  status?: number;
  /**
   * The regular expression for matching HTTP method (GET, POST, PUT, etc).
   * Optional, by default processing all HTTP method.
   */
  method?: string;
}

export interface BlacklistItem {
  urlPattern: string;
  statusCode: number;
  httpMethodPattern: string | null;
  responseCode: number;
  pattern: string;
  method: string | null;
}

export interface SetBandwidthLimitArgs {
  /**
   * Sets the downstream bandwidth limit in kbps
   */
  downstreamKbps?: number;
  /**
   * Sets the upstream bandwidth limit kbps
   * by default unlimited
   */
  upstreamKbps?: number;
  /**
   * Specifies how many kilobytes in total the client is allowed to download through the proxy
   * by default unlimited
   */
  downstreamMaxKB?: number;
  /**
   * Specifies how many kilobytes in total the client is allowed to upload through the proxy
   * by default unlimited
   */
  upstreamMaxKB?: number;
  /**
   * Add the given latency to each HTTP request
   * by default all requests are invoked without latency
   */
  latency?: number;
  /**
   * A boolean that enable bandwidth limiter.
   * by default to "false", but setting any of the properties above will implicitly enable throttling
   */
  enable?: boolean;
  /**
   * Specifying what percentage of data sent is payload, e.g. use this to take into account overhead due to tcp/ip
   */
  payloadPercentage?: number;
  /**
   * The max bits per seconds you want this instance of StreamManager to respect
   */
  maxBitsPerSecond?: number;
}

export interface BandwidthLimitsResponse {
  maxUpstreamKB: number;
  remainingUpstreamKB: number;
  maxDownstreamKB: number;
  remainingDownstreamKB: number;
}

export interface SetRewriteArgs {
  /**
   * A matching URL regular expression
   */
  matchRegex: string;
  /**
   * replacement URL
   */
  replace: string;
}

export interface SetRetryCountArgs {
  /**
   * The number of times a method will be retried.
   */
  retrycount: number;
}

export interface WaitArgs {
  /**
   * Wait till all request are being made
   */
  quietPeriodInMs: number;
  /**
   * Sets quiet period in milliseconds
   */
  timeoutInMs: number;
}

export interface SetTimeoutsArgs {
  /**
   * Request timeout in milliseconds.
   * A timeout value of -1 is interpreted as infinite timeout.
   * default to "-1".
   */
  requestTimeout?: number;
  /**
   * Read timeout in milliseconds. Which is the timeout for waiting for data or,
   * put differently, a maximum period inactivity between two consecutive data packets.
   * A timeout value of zero is interpreted as an infinite timeout.
   * default to "60000".
   */
  readTimeout?: number;
  /**
   * Determines the timeout in milliseconds until a connection is established.
   * A timeout value of zero is interpreted as an infinite timeout.
   * default to "60000".
   */
  connectionTimeout?: number;
  /**
   * Sets the maximum length of time that records will be stored in this Cache.
   * A nonpositive value disables this feature (that is, sets no limit).
   * default to "0".
   */
  dnsCacheTimeout?: number;
}
