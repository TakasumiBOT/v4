import os from "os";

const getCpuStatus = (interval: number): Promise<number> => {
  return new Promise((resolve) => {
    const startTimes = getCpuTime(os.cpus());

    setTimeout(() => {
      const endTimes = getCpuTime(os.cpus());

      const idleDifference = endTimes.idle - startTimes.idle;
      const totalDifference = endTimes.total - startTimes.total;

      let usagePercentage = 0;

      if (totalDifference > 0) {
        usagePercentage = 100 - (idleDifference / totalDifference) * 100;
      }

      resolve(Math.round(usagePercentage * 100) / 100);
    }, interval);
  });
};

const getCpuTime = (cpus: CpuData[]): { idle: number; total: number } => {
  let idle = 0;
  let total = 0;

  cpus.forEach((cpu) => {
    Object.keys(cpu.times).forEach((type) => {
      total += cpu.times[type as keyof CpuData["times"]];
    });

    idle += cpu.times.idle;
  });

  return { idle, total };
};

type CpuData = {
  model: string;
  speed: number;
  times: {
    user: number;
    nice: number;
    sys: number;
    idle: number;
    irq: number;
  };
};

export default getCpuStatus;
