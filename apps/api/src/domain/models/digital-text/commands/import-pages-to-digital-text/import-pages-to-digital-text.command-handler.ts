import { AggregateType } from '@coscrad/api-interfaces';
import { CommandHandler } from '@coscrad/commands';
import { Valid } from '../../../../../domain/domainModelValidators/Valid';
import IsInArray from '../../../../../domain/repositories/specifications/array-includes.specification';
import { DeluxeInMemoryStore } from '../../../../../domain/types/DeluxeInMemoryStore';
import { InMemorySnapshot } from '../../../../../domain/types/ResourceType';
import { InternalError } from '../../../../../lib/errors/InternalError';
import { BaseEvent } from '../../../../../queries/event-sourcing';
import { ResultOrError } from '../../../../../types/ResultOrError';
import { BaseUpdateCommandHandler } from '../../../shared/command-handlers/base-update-command-handler';
import { EventRecordMetadata } from '../../../shared/events/types/EventRecordMetadata';
import { validAggregateOrThrow } from '../../../shared/functional';
import { DigitalText } from '../../entities';
import { ImportPagesToDigitalText } from './import-pages-to-digital-text.command';
import { PagesImportedToDigitalText } from './import-pages-to-digital-text.event';

@CommandHandler(ImportPagesToDigitalText)
export class ImportPagesToDigitalTextCommandHandler extends BaseUpdateCommandHandler<DigitalText> {
    protected actOnInstance(
        digitalText: DigitalText,
        { pages }: ImportPagesToDigitalText
    ): ResultOrError<DigitalText> {
        return digitalText.importPages(
            pages.map(({ pageIdentifier, content, photographId }) => ({
                pageIdentifier,
                audioAndTextContent: content,
                photographId,
            }))
        );
    }

    protected async fetchRequiredExternalState({
        pages,
    }: ImportPagesToDigitalText): Promise<InMemorySnapshot> {
        const audioItemIds = pages.flatMap((page) =>
            page.content.map(({ audioItemId }) => audioItemId)
        );

        // todo leverage this
        const _audioItemSpec = new IsInArray('id', audioItemIds);

        const relevantAudioItems = await this.repositoryProvider
            .forResource(AggregateType.audioItem)
            .fetchMany();

        // const photographIds = pages.flatMap(({ photographId }) =>
        //     isNullOrUndefined(photographId) ? [] : [photographId]
        // );

        // todo add a filter and parallelize with the audio query
        const relevantPhotographs = await this.repositoryProvider
            .forResource(AggregateType.photograph)
            .fetchMany();

        return new DeluxeInMemoryStore({
            [AggregateType.audioItem]: relevantAudioItems.filter(validAggregateOrThrow),
            [AggregateType.photograph]: relevantPhotographs.filter(validAggregateOrThrow),
        }).fetchFullSnapshotInLegacyFormat();
    }

    protected validateExternalState(
        _state: InMemorySnapshot,
        _instance: DigitalText
    ): Valid | InternalError {
        return Valid;
    }

    protected buildEvent(
        payload: ImportPagesToDigitalText,
        eventMeta: EventRecordMetadata
    ): BaseEvent {
        return new PagesImportedToDigitalText(payload, eventMeta);
    }
}
