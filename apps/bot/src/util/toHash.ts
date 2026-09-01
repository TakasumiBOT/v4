import crypto from "crypto";

const toHash = (input: string): Buffer<ArrayBufferLike> => {
  return crypto.createHash("sha256").update(input).digest();
};

export default toHash;
