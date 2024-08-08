/**
 * Cleans the URL entered by the user by removing the protocol and www.
 */
export function cleanUrl(url: string) {
  return url.replace(/(https?:\/\/)?(www\.)?/i, "");
}
