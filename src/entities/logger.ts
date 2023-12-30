const COLORS = {
  error: '\x1b[31m',
  info: '\x1b[34m',
}
export class Logger {
  log(message: string, color = '\x1b[32m'): void {
    process.stdout.write(`${color}\n${message}\n`);
  }

  logInfo(msg: string) {
    this.log(msg, COLORS.info);
  }

  logError(msg: string) {
    this.log(msg, COLORS.error);
  }
}
