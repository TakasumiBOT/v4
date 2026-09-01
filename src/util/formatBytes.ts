const formatBytes = (bytes: number, decimals = 2): string => {
  if (!+bytes) return "0 Bytes";

  const baseSize = 1024;
  const sign = decimals < 0 ? 0 : decimals;
  const units = ["Bytes", "KiB", "MiB", "GiB", "TiB", "PiB", "EiB", "ZiB", "YiB"];

  const unitIndex = Math.floor(Math.log(bytes) / Math.log(baseSize));

  return `${parseFloat((bytes / Math.pow(baseSize, unitIndex)).toFixed(sign))} ${units[unitIndex]}`;
};

export default formatBytes;
