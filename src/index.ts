import {
  stringToTypedArray,
  stringFromTypedArray,
  separateIvFromData,
  joinIvAndData,
  createIV
} from "./helpers";

export function generateKey(rawKey: string) {
  return crypto.subtle.importKey(
    "raw",
    stringToTypedArray(rawKey).slice(0, 16),
    { name: "AES-CBC" },
    false,
    ["encrypt", "decrypt"]
  );
}

async function encrypt(data: string, key: CryptoKey) {
  const iv = createIV();
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-CBC", iv: iv },
    key,
    stringToTypedArray(data)
  );
  const ciphered = joinIvAndData(iv, new Uint8Array(encrypted));
  return btoa(stringFromTypedArray(ciphered));
}

async function decrypt(data: string, key: CryptoKey) {
  const parts = separateIvFromData(stringToTypedArray(atob(data)));
  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-CBC", iv: parts.iv },
    key,
    parts.data
  );
  return stringFromTypedArray(new Uint8Array(decrypted));
}

export function stringEncryptionInterface(key: CryptoKey) {
  return {
    async encrypt(data: string) {
      return encrypt(data, key);
    },
    async decrypt(data: string) {
      return decrypt(data, key);
    },
  };
}

const __ENCRYPTED_SYMBOK__ = Symbol("is_encrypted");

interface dataEncrypted<T> extends String {
  // Just so dataEncrypted !== string
  [__ENCRYPTED_SYMBOK__]: true;
}

export function jsonEncryptionInterface(key: CryptoKey) {
  return {
    async encrypt<T>(data: T): Promise<dataEncrypted<T>> {
      return encrypt(JSON.stringify(data), key) as any;
    },
    async decrypt<T>(data: dataEncrypted<T>): Promise<T> {
      return JSON.parse(await decrypt((data as unknown) as string, key));
    },
  };
}
