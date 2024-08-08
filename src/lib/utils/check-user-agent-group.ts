export function checkUserAgentGroup(userAgent: string) {
  const isAndroidUserAgent = /android/i.test(userAgent);
  const isIOSUserAgent = /iphone|ipad|ipod/i.test(userAgent);

  const userAgentGroup = isIOSUserAgent ? "ios" : isAndroidUserAgent ? "android" : "unknown";

  return userAgentGroup;
}
