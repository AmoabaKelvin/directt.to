import { customAlphabet } from "nanoid";

export function generateId(length: number) {
  const alphabet = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  const nanoid = customAlphabet(alphabet, length);

  return nanoid();
}
