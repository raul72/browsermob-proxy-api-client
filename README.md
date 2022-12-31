# BrowserMob Proxy API Client
Client library for [BrowserMob Proxy] API

Refer to [REST API] section of BrowserMob Proxy documentation for detailed information

[![npm](https://img.shields.io/npm/v/browsermob-proxy-api-client.svg?style=flat-square)](https://www.npmjs.org/package/browsermob-proxy-api-client)
[![install size](https://img.shields.io/badge/dynamic/json?url=https://packagephobia.com/v2/api.json?p=browsermob-proxy-api-client&query=$.install.pretty&label=install%20size&style=flat-square)](https://packagephobia.now.sh/result?p=browsermob-proxy-api-client)
[![npm bundle size](https://img.shields.io/bundlephobia/minzip/browsermob-proxy-api-client?style=flat-square)](https://bundlephobia.com/package/browsermob-proxy-api-client@latest)
[![npm downloads](https://img.shields.io/npm/dm/browsermob-proxy-api-client.svg?style=flat-square)](https://npm-stat.com/charts.html?package=browsermob-proxy-api-client)
[![Known Vulnerabilities](https://snyk.io/test/npm/browsermob-proxy-api-client/badge.svg?style=flat-square)](https://snyk.io/test/npm/browsermob-proxy-api-client)
[![Coverage](https://img.shields.io/codecov/c/github/raul72/browsermob-proxy-api-client?style=flat-square)](https://app.codecov.io/gh/raul72/browsermob-proxy-api-client)

## Installing

Using npm:

```bash
$ npm install browsermob-proxy-api-client
```

Using yarn:

```bash
$ yarn add browsermob-proxy-api-client
```

## Example

```typescript
import BrowserMobProxyAPIClient from 'browsermob-proxy-api-client';

const proxy = new BrowserMobProxyAPIClient('localhost', '8080');
const port = await proxy.start();
if (port) {
  try {
    await proxy.startHar(port);
    // exec `curl google.com --proxy localhost:${port}`
    const har = await proxy.getHar(port);
  } catch (e) {
    console.error(e);
  } finally {
    await proxy.stop(port);
  }
}
```

[BrowserMob Proxy]: https://github.com/lightbody/browsermob-proxy
[REST API]: https://github.com/lightbody/browsermob-proxy#rest-api
