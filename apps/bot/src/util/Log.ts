import config from "@/config";

class Log {
  private static getDate(): string {
    const now: Date = new Date();

    return `[${now.getMonth() + 1}/${now.getDate()} ${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}]`;
  }

  public static info(message: string): void {
    console.info(`\x1b[32m${this.getDate()} [INFO] ${message}\x1b[39m`);
  }

  public static warn(message: string): void {
    console.warn(`\x1b[33m${this.getDate()} [WARN] ${message}\x1b[39m`);
  }

  public static error(message: string): void {
    console.error(`\x1b[31m${this.getDate()} [ERROR] ${message}\x1b[39m`);
  }

  public static debug(message: string): void {
    if (!config.isDebug) return;

    console.debug(`\x1b[34m${this.getDate()} [DEBUG] ${message}\x1b[39m`);
  }
}

export default Log;
