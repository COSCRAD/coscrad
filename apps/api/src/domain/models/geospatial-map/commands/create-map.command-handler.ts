import { AggregateType, LanguageCode, MultilingualTextItemRole } from '@coscrad/api-interfaces';
import { CommandHandler } from '@coscrad/commands';
import { InternalError } from '../../../../lib/errors/InternalError';
import { ResultOrError } from '../../../../types/ResultOrError';
import { buildMultilingualTextWithSingleItem } from '../../../common/build-multilingual-text-with-single-item';
import { MultilingualTextItem } from '../../../common/entities/multilingual-text';
import { Valid } from '../../../domainModelValidators/Valid';
import { DeluxeInMemoryStore } from '../../../types/DeluxeInMemoryStore';
import { InMemorySnapshot } from '../../../types/ResourceType';
import { BaseCreateCommandHandler } from '../../shared/command-handlers/base-create-command-handler';
import { BaseEvent, IEventPayload } from '../../shared/events/base-event.entity';
import { EventRecordMetadata } from '../../shared/events/types/EventRecordMetadata';
import { GeospatialMap } from '../geospatial-map.entity';
import { CreateMap } from './create-map.command';
import { MapCreated, MapCreatedPayload } from './map-created.event';

@CommandHandler(CreateMap)
export class CreateMapCommandHandler extends BaseCreateCommandHandler<GeospatialMap> {
    protected createNewInstance({
        aggregateCompositeIdentifier: { id },
        name,
        languageCodeForName,
        description,
        languageCodeForDescription,
    }: CreateMap): ResultOrError<GeospatialMap> {
        return new GeospatialMap({
            type: AggregateType.map,
            id,
            name: buildMultilingualTextWithSingleItem(name, languageCodeForName),
            description: buildMultilingualTextWithSingleItem(
                description,
                languageCodeForDescription
            ),
            spatialFeatures: [],
        });
    }

    protected validateExternalState(
        state: InMemorySnapshot,
        instance: GeospatialMap
    ): InternalError | Valid {
        return instance.validateExternalState(state);
    }

    protected async fetchRequiredExternalState(_command?: CreateMap): Promise<InMemorySnapshot> {
        return new DeluxeInMemoryStore({}).fetchFullSnapshotInLegacyFormat();
    }

    protected buildEvent(
        payload: CreateMap,
        eventMeta: EventRecordMetadata
    ): BaseEvent<IEventPayload> {
        const eventPayload: MapCreatedPayload = {
            aggregateCompositeIdentifier: payload.aggregateCompositeIdentifier,
            name: new MultilingualTextItem({
                text: 'name of the map',
                languageCode: LanguageCode.Chilcotin,
                role: MultilingualTextItemRole.original,
            }),
            languageCodeForName: LanguageCode.Chilcotin,
            description: new MultilingualTextItem({
                text: 'description of the map',
                languageCode: LanguageCode.English,
                role: MultilingualTextItemRole.original,
            }),
        };
        return new MapCreated(eventPayload, eventMeta);
    }
}
