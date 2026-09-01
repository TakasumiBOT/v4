import { randomBytes } from "crypto";

const createId = (length: number): string => {
  const byteRange = 256;
  const charset = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";

  if (length <= 0 || length > byteRange)
    throw new Error(`生成する文字数は0以上${byteRange}以下にしてください`);

  let result = "";

  while (result.length < length) {
    const bytes = randomBytes(length);

    for (const byte of bytes) {
      result += charset[byte % charset.length];
      if (result.length === length) break;
    }
  }

  return result;
};

export default createId;
