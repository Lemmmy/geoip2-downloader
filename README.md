# GeoIP2 Downloader

This module is a simple downloader for the [MaxMind GeoIP2 database](https://www.maxmind.com/en/geoip-demo). It is
extracted from [my fork](https://github.com/Lemmmy/geoip2-cli) of svtslv's
[geoip2-cli](https://github.com/svtslv/geoip2-cli) project, and is intended to be used in conjunction with the
[maxmind](https://www.npmjs.com/package/maxmind) module.

**Only** downloads the database, does not do any lookups or conversions. Currently only downloads to a file.

This is an ES module.

### Installation

```bash
yarn add @lemmmy/geoip2-downloader
```

### Examples

```ts
import { downloadGeoip2 } from "@lemmmy/geoip2-downloader";

await downloadGeoip2
  .download({
    licenseKey:   process.env.MAXMIND_LICENSE_KEY,
    edition:      "city", // One of: "city", "country", "asn"
    downloadPath: "/geoip-databases/", // Directory to download to, will be created with mkdirp
    date:         "", // Optional, defaults to latest
  })
  .then(path => console.log(path));
```

## License

MIT
