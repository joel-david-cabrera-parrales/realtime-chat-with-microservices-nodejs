import { DataSource } from "typeorm";

export enum AvailableDatasource {
  postgres = 'postgres'
}

interface CustomDatasourceProps {
  type: AvailableDatasource;
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  logging: boolean;
  synchronize: boolean;
}

export class TORMDatasouce {
  private datasouce: DataSource;

  constructor(props: CustomDatasourceProps) {
    const $props = {
      ...props,
      entities: [__dirname + "/entities/**/*{.js,.ts}"],
    };
    this.datasouce = new DataSource($props);
  }

  get appDatasource() {
    return this.datasouce;
  }
}
