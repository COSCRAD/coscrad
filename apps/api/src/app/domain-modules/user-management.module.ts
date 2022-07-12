import { CommandModule } from '@coscrad/commands';
import { Module } from '@nestjs/common';
import { CoscradUserGroupQueryService } from '../../domain/services/query-services/coscrad-user-group-query.service';
import { CoscradUserQueryService } from '../../domain/services/query-services/coscrad-user-query.service';
import { PersistenceModule } from '../../persistence/persistence.module';
import { CommandInfoService } from '../controllers/command/services/command-info-service';
import { CoscradUserGroupController } from '../controllers/coscrad-user-group.controller';
import { CoscradUserController } from '../controllers/coscrad-user.controller';

@Module({
    imports: [PersistenceModule, CommandModule],
    controllers: [CoscradUserController, CoscradUserGroupController],
    providers: [CoscradUserQueryService, CoscradUserGroupQueryService, CommandInfoService],
})
export class UserManagementModule {}
