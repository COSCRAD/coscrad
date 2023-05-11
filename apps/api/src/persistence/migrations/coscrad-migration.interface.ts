import { ICoscradQueryRunner } from './coscrad-query-runner.interface';

export interface ICoscradMigration {
    up(queryRunner: ICoscradQueryRunner, ...args: unknown[]): Promise<void>;

    down(queryRunner: ICoscradQueryRunner, ...args: unknown[]): Promise<void>;
}
