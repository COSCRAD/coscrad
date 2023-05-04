import { Module } from '@nestjs/common';
import { AppModule } from '../app/app.module';
import { PersistenceModule } from '../persistence/persistence.module';
import { DomainDumpCliCommand } from './domain-dump.cli-command';
import { DomainRestoreCliCommand } from './domain-restore.cli-command';

@Module({
    providers: [DomainDumpCliCommand, DomainRestoreCliCommand],
    imports: [AppModule, PersistenceModule],
})
export class CoscradCliModule {}
