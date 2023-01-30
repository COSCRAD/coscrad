import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ArangoRepositoryProvider } from '../repositories/arango-repository.provider';
import { ArangoConnectionProvider } from './arango-connection.provider';
import { ArangoDatabaseProvider } from './database.provider';

@Global()
@Module({
    imports: [DatabaseModule],
    // TODO Should the repositories have their own module?
    providers: [
        ConfigService,
        ArangoDatabaseProvider,
        ArangoRepositoryProvider,
        ArangoConnectionProvider,
    ],
    exports: [ArangoConnectionProvider],
})
export class DatabaseModule {}
