import { shardRedis } from "@/util/redis";
import getCpuStatus from "@/util/getCpuStatus";
import { botEnv as env } from "@takasumibot-v4/env/bot";
import getMemoryStatus from "@/util/getMemoryStatus";

async function updateMachineStatus() {
  try {
    await Promise.all([
      shardRedis.set(`shard:machine:cpu:${env.MACHINE_ID}`, await getCpuStatus(5000)),
      shardRedis.set(`shard:machine:ram:${env.MACHINE_ID}`, getMemoryStatus().usage),
    ]);
  } catch (error) {
    console.error(`Machine ID: ${env.MACHINE_ID}`, error);
  }
}

export default updateMachineStatus;
