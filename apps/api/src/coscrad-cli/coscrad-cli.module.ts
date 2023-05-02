import { Module } from '@nestjs/common';
import { AppModule } from '../app/app.module';
import { DomainDumpCliCommand } from './domain-dump.cli-command';

@Module({
    providers: [DomainDumpCliCommand],
    imports: [AppModule],
})
export class CoscradCliModule {}
