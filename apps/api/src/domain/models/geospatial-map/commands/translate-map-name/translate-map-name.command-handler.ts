import { CommandHandler, ICommand } from '@coscrad/commands';
import {
    MultilingualTextItem,
    MultilingualTextItemRole,
} from '../../../../../domain/common/entities/multilingual-text';
import { Valid } from '../../../../../domain/domainModelValidators/Valid';
import { DeluxeInMemoryStore } from '../../../../../domain/types/DeluxeInMemoryStore';
import { InMemorySnapshot } from '../../../../../domain/types/ResourceType';
import { InternalError } from '../../../../../lib/errors/InternalError';
import { ResultOrError } from '../../../../../types/ResultOrError';
import { BaseUpdateCommandHandler } from '../../../shared/command-handlers/base-update-command-handler';
import { BaseEvent, IEventPayload } from '../../../shared/events/base-event.entity';
import { EventRecordMetadata } from '../../../shared/events/types/EventRecordMetadata';
import { GeospatialMap } from '../../geospatial-map.entity';
import { MapNameTranslated } from './map-name-translated.event';
import { TranslateMapName } from './translate-map-name.command';

@CommandHandler(TranslateMapName)
export class TranslateMapNameCommandHandler extends BaseUpdateCommandHandler<GeospatialMap> {
    protected actOnInstance(
        instance: GeospatialMap,
        { translationOfName, languageCode }: TranslateMapName
    ): ResultOrError<GeospatialMap> {
        return instance.translateName(translationOfName, languageCode);
    }

    protected fetchRequiredExternalState(_command?: ICommand): Promise<InMemorySnapshot> {
        return Promise.resolve(new DeluxeInMemoryStore({}).fetchFullSnapshotInLegacyFormat());
    }

    protected validateExternalState(
        _state: InMemorySnapshot,
        _instance: GeospatialMap,
        _command?: ICommand
    ): InternalError | Valid {
        return Valid;
    }

    protected buildEvent(
        payload: TranslateMapName,
        eventMeta: EventRecordMetadata
    ): BaseEvent<IEventPayload> {
        const { aggregateCompositeIdentifier, languageCode, translationOfName } = payload;

        return new MapNameTranslated(
            {
                aggregateCompositeIdentifier,
                name: new MultilingualTextItem({
                    languageCode,
                    text: translationOfName,
                    role: MultilingualTextItemRole.original,
                }),
            },
            eventMeta
        );
    }
}
