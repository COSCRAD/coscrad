import { CommandHandlerService } from '@coscrad/commands';
import TestRepositoryProvider from '../../../../../persistence/repositories/__tests__/TestRepositoryProvider';
import { IIdManager } from '../../../../interfaces/id-manager.interface';

export type CommandAssertionDependencies = {
    testRepositoryProvider: TestRepositoryProvider;
    commandHandlerService: CommandHandlerService;
    idManager: IIdManager;
};
