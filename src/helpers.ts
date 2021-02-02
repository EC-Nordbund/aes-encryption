const ivLen = 16; // the IV is always 16 bytes

export function createIV() {
  const initializationVector = new Uint8Array(ivLen);
  crypto.getRandomValues(initializationVector);
  return initializationVector;
}

export function stringToTypedArray(str: string) {
  return new Uint8Array(str.split("").map((v) => v.charCodeAt(0)));
}
export function stringFromTypedArray(arr: Uint8Array) {
  return String.fromCharCode(...arr);
}

export function separateIvFromData(buf: Uint8Array) {
  var iv = new Uint8Array(ivLen);
  var data = new Uint8Array(buf.length - ivLen);
  buf.forEach((byte, i) => {
    if (i < ivLen) {
      iv[i] = byte;
    } else {
      data[i - ivLen] = byte;
    }
  });
  return { iv: iv, data: data };
}

export function joinIvAndData(iv: Uint8Array, data: Uint8Array) {
  var buf = new Uint8Array(iv.length + data.length);
  iv.forEach((byte, i) => (buf[i] = byte));
  data.forEach((byte, i) => (buf[ivLen + i] = byte));
  return buf;
}