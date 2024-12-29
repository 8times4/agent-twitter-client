//reference: https://github.com/FixTweet/FxTwitter/blob/main/src/helpers/useragent.ts

//Implement Cloudflare Worker's String.format()
declare global {
  interface String {
    format(params: Record<string, string>): string;
  }
}

String.prototype.format = function (params: Record<string, string>): string {
  return Object.entries(params).reduce(
    (str, [key, value]) => str.replace(new RegExp(`{${key}}`, 'g'), value),
    this.toString(),
  );
};

/* We keep this value up-to-date for making our requests to Twitter as
   indistinguishable from normal user traffic as possible. */
const fakeChromeVersion = 130;
const platformWindows = 'Windows NT 10.0; Win64; x64';
const platformMac = 'Macintosh; Intel Mac OS X 14_7_2';
const platformLinux = 'X11; Linux x86_64';
const platformAndroid = 'Linux; Android 14; K';
const chromeUA = `Mozilla/5.0 ({platform}) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/{version}.0.0.0 Safari/537.36`;
const edgeUA = `Mozilla/5.0 ({platform}) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/{version}.0.0.0 Safari/537.36 Edg/{version}.0.0.0`;
const braveUA = `Mozilla/5.0 ({platform}) AppleWebKit/537.36 (KHTML, like Gecko) Brave/{version}.0.6754.119 Safari/537.36`;
const chromeMobileUA = `Mozilla/5.0 ({platform}) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/{version}.0.0.0 Mobile Safari/537.36`;
const edgeMobileUA = `Mozilla/5.0 ({platform}) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/{version}.0.0.0 Mobile Safari/537.36 Edg/{version}.0.0.0`;
enum Platforms {
  Windows,
  Mac,
  Linux,
  Android,
}

/* Return a random version of Chrome between current and 2 previous versions (i.e. For 109, also return 108 or 107) */
const getRandomVersion = (): number =>
  fakeChromeVersion - Math.floor(Math.random() * 3);

export const generateUserAgent = (): [string, string] => {
  const platform = Math.floor(Math.random() * 4);
  const isEdge = Math.random() > 0.5;
  const isBrave = Math.random() > 0.6;
  const version = getRandomVersion();

  let userAgent = isEdge ? edgeUA : isBrave ? braveUA : chromeUA;
  userAgent = userAgent.format({ version: String(version) });
  const secChUaChrome = `".Not/A)Brand";v="99", "Google Chrome";v="{version}", "Chromium";v="{version}"`;
  const secChUaEdge = `".Not/A)Brand";v="99", "Microsoft Edge";v="{version}", "Chromium";v="{version}"`;
  const secChUaBrave = `".Not/A)Brand";v="99", "Brave";v="{version}", "Chromium";v="{version}"`;
  const secChUa = (
    isEdge ? secChUaEdge : isBrave ? secChUaBrave : secChUaChrome
  ).format({
    version: String(version),
  });

  switch (platform) {
    case Platforms.Mac:
      return [userAgent.format({ platform: platformMac }), secChUa];
    case Platforms.Linux:
      return [userAgent.format({ platform: platformLinux }), secChUa];
    case Platforms.Android:
      userAgent = isEdge ? edgeMobileUA : chromeMobileUA;
      return [
        userAgent.format({
          platform: platformAndroid,
          version: String(version),
        }),
        secChUa,
      ];
    default:
      return [userAgent.format({ platform: platformWindows }), secChUa];
  }
};
