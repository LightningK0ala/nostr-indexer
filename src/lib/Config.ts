export class Config {
  public dbPath: string;
  public debug: boolean;

  constructor({ dbPath, debug = false }: Config) {
    this.dbPath = dbPath;
    this.debug = debug;
  }
}
