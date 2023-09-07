import { AggregateType, ResourceType } from '@coscrad/api-interfaces';
import { CommandHandler } from '@coscrad/commands';
import { buildMultilingualTextWithSingleItem } from '../../../../../domain/common/build-multilingual-text-with-single-item';
import { Valid } from '../../../../../domain/domainModelValidators/Valid';
import getInstanceFactoryForResource from '../../../../../domain/factories/getInstanceFactoryForResource';
import { DeluxeInMemoryStore } from '../../../../../domain/types/DeluxeInMemoryStore';
import { InMemorySnapshot } from '../../../../../domain/types/ResourceType';
import { InternalError } from '../../../../../lib/errors/InternalError';
import { DTO } from '../../../../../types/DTO';
import { ResultOrError } from '../../../../../types/ResultOrError';
import { BaseCreateCommandHandler } from '../../../shared/command-handlers/base-create-command-handler';
import { BaseEvent } from '../../../shared/events/base-event.entity';
import { validAggregateOrThrow } from '../../../shared/functional';
import { VocabularyList } from '../../entities/vocabulary-list.entity';
import { CreateVocabularyList } from './create-vocabulary-list.command';
import { vocabularyListCreated } from './vocabulary-list.created.event';

@CommandHandler(CreateVocabularyList)
export class CreateVocabularyListCommandHandler extends BaseCreateCommandHandler<VocabularyList> {
    protected createNewInstance({
        aggregateCompositeIdentifier: { id },
        name,
        languageCodeForName,
    }: CreateVocabularyList): ResultOrError<VocabularyList> {
        const createDto: DTO<VocabularyList> = {
            id,
            type: AggregateType.vocabularyList,
            name: buildMultilingualTextWithSingleItem(name, languageCodeForName),
            entries: [],
            variables: [],
            published: false,
        };

        const newInstanceOrError = getInstanceFactoryForResource<VocabularyList>(
            ResourceType.vocabularyList
        )(createDto);
        return newInstanceOrError;
    }

    protected async fetchRequiredExternalState(
        _command?: CreateVocabularyList
    ): Promise<InMemorySnapshot> {
        const allVocabularyLists = await this.repositoryProvider
            .forResource(AggregateType.vocabularyList)
            .fetchMany();

        return new DeluxeInMemoryStore({
            [AggregateType.vocabularyList]: allVocabularyLists.filter(validAggregateOrThrow),
        }).fetchFullSnapshotInLegacyFormat();
    }

    protected validateExternalState(
        state: InMemorySnapshot,
        instance: VocabularyList
    ): InternalError | Valid {
        return instance.validateExternalState(state);
    }

    protected buildEvent(
        command: CreateVocabularyList,
        eventId: string,
        userId: string
    ): BaseEvent {
        return new vocabularyListCreated(command, eventId, userId);
    }
}
