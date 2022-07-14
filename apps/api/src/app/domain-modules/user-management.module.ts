import { CommandModule } from '@coscrad/commands';
import { Module } from '@nestjs/common';
import { CreateGroup } from '../../domain/models/user-management/group/commands/create-group.command';
import { CreateGroupCommandHandler } from '../../domain/models/user-management/group/commands/create-group.command-handler';
import { RegisterUser } from '../../domain/models/user-management/user/commands/register-user.command';
import { RegisterUserCommandHandler } from '../../domain/models/user-management/user/commands/register-user.command-handler';
import { CoscradUserGroupQueryService } from '../../domain/services/query-services/coscrad-user-group-query.service';
import { CoscradUserQueryService } from '../../domain/services/query-services/coscrad-user-query.service';
import { IdGenerationModule } from '../../lib/id-generation/id-generation.module';
import { PersistenceModule } from '../../persistence/persistence.module';
import { CommandInfoService } from '../controllers/command/services/command-info-service';
import { CoscradUserGroupController } from '../controllers/coscrad-user-group.controller';
import { CoscradUserController } from '../controllers/coscrad-user.controller';

@Module({
    imports: [PersistenceModule, CommandModule, IdGenerationModule],
    controllers: [CoscradUserController, CoscradUserGroupController],
    providers: [
        CoscradUserQueryService,
        CoscradUserGroupQueryService,
        CommandInfoService,
        RegisterUser,
        RegisterUserCommandHandler,
        CreateGroup,
        CreateGroupCommandHandler,
    ],
})
export class UserManagementModule {}
