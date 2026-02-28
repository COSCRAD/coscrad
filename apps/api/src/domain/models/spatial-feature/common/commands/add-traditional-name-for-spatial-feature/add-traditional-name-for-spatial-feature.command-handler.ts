import { CommandHandler, ICommand } from '@coscrad/commands';
import {
    MultilingualTextItem,
    MultilingualTextItemRole,
} from '../../../../../../domain/common/entities/multilingual-text';
import { Valid } from '../../../../../../domain/domainModelValidators/Valid';
import { DeluxeInMemoryStore } from '../../../../../../domain/types/DeluxeInMemoryStore';
import { InMemorySnapshot } from '../../../../../../domain/types/ResourceType';
import { InternalError } from '../../../../../../lib/errors/InternalError';
import { BaseEvent } from '../../../../../../queries/event-sourcing';
import { ResultOrError } from '../../../../../../types/ResultOrError';
import { BaseUpdateCommandHandler } from '../../../../shared/command-handlers/base-update-command-handler';
import { EventRecordMetadata } from '../../../../shared/events/types/EventRecordMetadata';
import { Point } from '../../../point/entities/point.entity';
import { AddTraditionalNameForSpatialFeature } from './add-traditional-name-for-spatial-feature.command';
import { TraditionalNameAddedForSpatialFeature } from './traditional-name-added-for-spatial-feature.event';

@CommandHandler(AddTraditionalNameForSpatialFeature)
export class AddTraditionalNameForSpatialFeatureCommandHandler extends BaseUpdateCommandHandler<Point> {
    protected actOnInstance(
        instance: Point,
        { text, languageCode }: AddTraditionalNameForSpatialFeature
    ): ResultOrError<Point> {
        return instance.addTraditionalName(text, languageCode);
    }

    protected fetchRequiredExternalState(_command?: ICommand): Promise<InMemorySnapshot> {
        return Promise.resolve(new DeluxeInMemoryStore({}).fetchFullSnapshotInLegacyFormat());
    }

    protected validateExternalState(
        state: InMemorySnapshot,
        instance: Point
    ): Valid | InternalError {
        return instance.validateExternalState(state);
    }

    protected buildEvent(
        { aggregateCompositeIdentifier, text, languageCode }: AddTraditionalNameForSpatialFeature,
        eventMeta: EventRecordMetadata
    ): BaseEvent {
        return new TraditionalNameAddedForSpatialFeature(
            {
                aggregateCompositeIdentifier,
                text: new MultilingualTextItem({
                    text,
                    languageCode,
                    role: MultilingualTextItemRole.original,
                }),
            },
            eventMeta
        );
    }
}
