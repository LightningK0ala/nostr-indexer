export type ConfigArgs = {
  dbPath: string;
  debug?: boolean;
};
export class Config {
  public dbPath: string;
  public debug: boolean;

  constructor({ dbPath, debug = false }: ConfigArgs) {
    this.dbPath = dbPath;
    this.debug = debug;
  }
}
