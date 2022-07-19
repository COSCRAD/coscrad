import { Ack, CommandHandler, ICommandHandler } from '@coscrad/commands';
import { Inject } from '@nestjs/common';
import { InternalError, isInternalError } from '../../../../../lib/errors/InternalError';
import { isNotFound } from '../../../../../lib/types/not-found';
import { isOK, OK } from '../../../../../lib/types/ok';
import { RepositoryProvider } from '../../../../../persistence/repositories/repository.provider';
import formatAggregateCompositeIdentifier from '../../../../../view-models/presentation/formatAggregateCompositeIdentifier';
import { isValid } from '../../../../domainModelValidators/Valid';
import { IIdManager } from '../../../../interfaces/id-manager.interface';
import { AggregateCompositeIdentifier } from '../../../../types/AggregateCompositeIdentifier';
import { AggregateType } from '../../../../types/AggregateType';
import { Resource } from '../../../resource.entity';
import { CoscradUser } from '../../../user-management/user/entities/user/coscrad-user.entity';
import validateCommandPayloadType from '../../command-handlers/utilities/validateCommandPayloadType';
import AggregateNotFoundError from '../../common-command-errors/AggregateNotFoundError';
import CommandExecutionError from '../../common-command-errors/CommandExecutionError';
import { GrantResourceReadAccessToUser } from './grant-resource-read-access-to-user.command';
import { ResourceReadAccessGrantedToUser } from './resource-read-access-granted-to-user.event';

const buildTopLevelError = (innerErrors: InternalError[]): InternalError =>
    new CommandExecutionError(innerErrors);

@CommandHandler(GrantResourceReadAccessToUser)
export class GrantResourceReadAccessToUserCommandHandler implements ICommandHandler {
    constructor(
        protected readonly repositoryProvider: RepositoryProvider,
        @Inject('ID_MANAGER') protected readonly idManager: IIdManager
    ) {}

    async execute(
        command: GrantResourceReadAccessToUser,
        commandType: string
    ): Promise<Ack | Error> {
        const typeValidationResult = validateCommandPayloadType(command, commandType);

        if (!isValid(typeValidationResult)) return typeValidationResult;

        const { userId, resourceCompositeIdentifier } = command;

        const { type: resourceType, id } = resourceCompositeIdentifier;

        const [userSearchResult, resourceSearchResult] = await Promise.all([
            this.repositoryProvider.getUserRepository().fetchById(userId),
            this.repositoryProvider.forResource(resourceType).fetchById(id),
        ]);

        if (isInternalError(userSearchResult)) {
            throw new InternalError(
                `Failed to fetch existing user when handling GRANT_RESOURCE_READ_ACCESS_TO_USER`,
                [userSearchResult]
            );
        }

        if (isInternalError(resourceSearchResult)) {
            throw new InternalError(
                `Failed to fetch resource: ${formatAggregateCompositeIdentifier(
                    resourceCompositeIdentifier
                )} when handling GRANT_RESOURCE_READ_ACCESS_TO_USER`
            );
        }

        const notFoundErrors = [
            [userSearchResult, { type: AggregateType.user, id: userId }],
            [resourceSearchResult, resourceCompositeIdentifier],
        ]
            .map(([result, compositeId]) =>
                isNotFound(result)
                    ? new AggregateNotFoundError(compositeId as AggregateCompositeIdentifier)
                    : OK
            )
            .filter((result): result is InternalError => !isOK(result));

        if (notFoundErrors.length > 0) {
            return buildTopLevelError(notFoundErrors);
        }

        const user = userSearchResult as CoscradUser;

        const resource = resourceSearchResult as Resource;

        const resourceUpdateResult = resource.grantReadAccessToUser(user.id);

        if (isInternalError(resourceUpdateResult))
            return buildTopLevelError([resourceUpdateResult]);

        const eventId = await this.idManager.generate();

        const updatedResourceWithEvents = resourceUpdateResult.addEventToHistory(
            new ResourceReadAccessGrantedToUser(command, eventId)
        );

        /**
         * We do this first because it's better to have an unused ID marked as used
         * than a used ID marked as available in case of failure.
         */
        await this.idManager.use(eventId);

        await this.repositoryProvider.forResource(resourceType).update(updatedResourceWithEvents);

        return Ack;
    }
}
