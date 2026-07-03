import { MultilingualTextItemRole } from '@coscrad/api-interfaces';
import { CommandHandler } from '@coscrad/commands';
import { MultilingualTextItem } from '../../../../../../domain/common/entities/multilingual-text';
import { Valid } from '../../../../../../domain/domainModelValidators/Valid';
import { DeluxeInMemoryStore } from '../../../../../../domain/types/DeluxeInMemoryStore';
import { InMemorySnapshot } from '../../../../../../domain/types/ResourceType';
import { InternalError } from '../../../../../../lib/errors/InternalError';
import { ResultOrError } from '../../../../../../types/ResultOrError';
import { BaseUpdateCommandHandler } from '../../../../shared/command-handlers/base-update-command-handler';
import { BaseEvent, IEventPayload } from '../../../../shared/events/base-event.entity';
import { EventRecordMetadata } from '../../../../shared/events/types/EventRecordMetadata';
import { Point } from '../../entities/point.entity';
import { AddAlternativeNameForSpatialFeature } from './add-alternative-name-for-spatial-feature.command';
import {
    AlternativeNameAddedForSpatialFeature,
    AlternativeNameAddedForSpatialFeaturePayload,
} from './alternative-name-added-for-spatial-feature.event';

@CommandHandler(AddAlternativeNameForSpatialFeature)
export class AddAlternativeNameForSpatialFeatureCommandHandler extends BaseUpdateCommandHandler<Point> {
    protected actOnInstance(
        instance: Point,
        { label, text, languageCode }: AddAlternativeNameForSpatialFeature
    ): ResultOrError<Point> {
        return instance.addAlternativeName(label, text, languageCode);
    }

    protected fetchRequiredExternalState(
        _command?: AddAlternativeNameForSpatialFeature
    ): Promise<InMemorySnapshot> {
        return Promise.resolve(new DeluxeInMemoryStore({}).fetchFullSnapshotInLegacyFormat());
    }

    protected validateExternalState(
        _state: InMemorySnapshot,
        _instance: Point
    ): InternalError | Valid {
        return Valid;
    }

    protected buildEvent(
        commandPayload: AddAlternativeNameForSpatialFeature,
        eventMeta: EventRecordMetadata
    ): BaseEvent<IEventPayload> {
        const { aggregateCompositeIdentifier, label, text, languageCode } = commandPayload;

        const eventPayload: AlternativeNameAddedForSpatialFeaturePayload = {
            aggregateCompositeIdentifier,
            label,
            textItem: new MultilingualTextItem({
                text,
                languageCode,
                role: MultilingualTextItemRole.original,
            }),
        };

        return new AlternativeNameAddedForSpatialFeature(eventPayload, eventMeta);
    }
}
