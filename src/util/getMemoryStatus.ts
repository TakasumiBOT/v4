import os from "os";
import fs from "fs";

const getMemoryStatus = (): { total: number; free: number; usage: number } => {
  const meminfo = fs.readFileSync("/proc/meminfo", "utf-8").split("\n");
  const freemem =
    Number(meminfo.find((v) => v.startsWith("MemAvailable"))!.replaceAll(/[^\d]/g, "")) * 1024; //os.freememではavailableSizeを取得できないので値を変更し、最後に型を合わせる。
  const totalmem = os.totalmem();

  return {
    total: totalmem,
    free: freemem,
    usage: 100 - Math.floor((freemem / totalmem) * 100),
  };
};

export default getMemoryStatus;
