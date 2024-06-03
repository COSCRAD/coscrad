import { AggregateType, ResourceType } from '@coscrad/api-interfaces';
import { CommandHandler } from '@coscrad/commands';
import { buildMultilingualTextWithSingleItem } from '../../../../../domain/common/build-multilingual-text-with-single-item';
import { Valid } from '../../../../../domain/domainModelValidators/Valid';
import { HasName } from '../../../../../domain/repositories/specifications';
import { DeluxeInMemoryStore } from '../../../../../domain/types/DeluxeInMemoryStore';
import { InMemorySnapshot } from '../../../../../domain/types/ResourceType';
import { InternalError, isInternalError } from '../../../../../lib/errors/InternalError';
import { isNotFound } from '../../../../../lib/types/not-found';
import { DTO } from '../../../../../types/DTO';
import { ResultOrError } from '../../../../../types/ResultOrError';
import getInstanceFactoryForResource from '../../../../factories/get-instance-factory-for-resource';
import { BaseCreateCommandHandler } from '../../../shared/command-handlers/base-create-command-handler';
import { BaseEvent } from '../../../shared/events/base-event.entity';
import { EventRecordMetadata } from '../../../shared/events/types/EventRecordMetadata';
import { validAggregateOrThrow } from '../../../shared/functional';
import { VocabularyList } from '../../entities/vocabulary-list.entity';
import { CreateVocabularyList } from './create-vocabulary-list.command';
import { VocabularyListCreated } from './vocabulary-list-created.event';

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

    protected async fetchRequiredExternalState({
        name,
        aggregateCompositeIdentifier: { id },
    }: CreateVocabularyList): Promise<InMemorySnapshot> {
        const [
            searchResultForVocabularyListWithSameName,
            searchResultForExistingVocabularyListWithThisId,
        ] = await Promise.all([
            this.repositoryProvider
                .forResource<VocabularyList>(AggregateType.vocabularyList)
                .fetchMany(
                    // @ts-expect-error We need to sort out whether we express these specifications in the persistence or domain model language
                    new HasName(name)
                ),
            this.repositoryProvider.forResource(AggregateType.vocabularyList).fetchById(id),
        ]);

        const allVocabularyLists = [];

        if (isInternalError(searchResultForExistingVocabularyListWithThisId)) {
            throw new InternalError(`Encountered invalid existing state in the database`, [
                searchResultForExistingVocabularyListWithThisId,
            ]);
        }

        if (!isNotFound(searchResultForExistingVocabularyListWithThisId)) {
            allVocabularyLists.push(searchResultForExistingVocabularyListWithThisId);
        }

        if (searchResultForVocabularyListWithSameName.length > 0) {
            allVocabularyLists.push(
                ...searchResultForVocabularyListWithSameName.filter(validAggregateOrThrow)
            );
        }

        return new DeluxeInMemoryStore({
            [AggregateType.vocabularyList]: allVocabularyLists,
        }).fetchFullSnapshotInLegacyFormat();
    }

    protected validateExternalState(
        state: InMemorySnapshot,
        instance: VocabularyList
    ): InternalError | Valid {
        return instance.validateExternalState(state);
    }

    protected buildEvent(command: CreateVocabularyList, eventMeta: EventRecordMetadata): BaseEvent {
        return new VocabularyListCreated(command, eventMeta);
    }
}
