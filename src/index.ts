import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import tar from 'tar';
import { mkdirp } from 'mkdirp';
import { Readable } from 'node:stream';

export const EDITIONS = {
  city   : "GeoLite2-City",
  country: "GeoLite2-Country",
  asn    : "GeoLite2-ASN",
} as const;

export type Edition = keyof typeof EDITIONS;

export interface DownloadGeoip2Options {
  licenseKey: string;
  edition: Edition;
  downloadPath: string;
  date?: string;
}

export async function downloadGeoip2({
  licenseKey,
  edition,
  date,
  downloadPath
}: DownloadGeoip2Options): Promise<string> {
  if (!licenseKey) {
    throw new Error("License key is not configured. Go to https://www.maxmind.com/en/geolite2/signup, obtain your " +
      "free license key, and pass it to `licenseKey`.");
  }
  if (!EDITIONS[edition]) throw new Error(`Invalid edition. Valid editions are: ${Object.keys(EDITIONS).join(", ")}`);
  if (!downloadPath) throw new Error("Download path not specified.");

  const stat = await fs.promises.stat(downloadPath).catch(() => null);
  if (stat && !stat.isDirectory()) throw new Error("Download path already exists and is not a directory.");
  if (!stat) await mkdirp(downloadPath);

  const url = "https://download.maxmind.com/app/geoip_download?" + new URLSearchParams({
    license_key: licenseKey,
    edition_id : EDITIONS[edition],
    suffix     : "tar.gz",
    date       : date || ""
  }).toString();

  return new Promise(async (resolve, reject) => {
    // Fetch the database tar.gz from the URL
    const res = await fetch(url);
    if (!res.ok || !res.body) {
      reject(new Error(`HTTP error: ${res.statusText}`));
      return;
    }

    Readable.fromWeb(res.body as any)
      // Un-gzip the response
      .pipe(zlib.createGunzip()
        .on("error", e => reject(new Error("Link not found. Invalid licenseKey?", { cause: e }))))
      // Get the tar entries
      .pipe(tar.t())
      .on("entry", entry => {
        // Look for the .mmdb file
        if (entry.path.endsWith(".mmdb")) {
          const dest = path.join(downloadPath, path.basename(entry.path));
          entry.pipe(fs.createWriteStream(dest))
            .on("finish", () => resolve(dest))
            .on("error", reject);
        }
      });
  });
}
