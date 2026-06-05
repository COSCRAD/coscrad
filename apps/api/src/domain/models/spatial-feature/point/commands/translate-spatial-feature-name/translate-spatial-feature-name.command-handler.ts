import { CommandHandler, ICommand } from '@coscrad/commands';
import {
    MultilingualTextItem,
    MultilingualTextItemRole,
} from '../../../../../../domain/common/entities/multilingual-text';
import { DeluxeInMemoryStore } from '../../../../../../domain/types/DeluxeInMemoryStore';
import { InternalError } from '../../../../../../lib/errors/InternalError';
import { ResultOrError } from '../../../../../../types/ResultOrError';
import { Valid } from '../../../../../domainModelValidators/Valid';
import { InMemorySnapshot } from '../../../../../types/ResourceType';
import { BaseUpdateCommandHandler } from '../../../../shared/command-handlers/base-update-command-handler';
import { BaseEvent, IEventPayload } from '../../../../shared/events/base-event.entity';
import { EventRecordMetadata } from '../../../../shared/events/types/EventRecordMetadata';
import { Point } from '../../entities/point.entity';
import { SpatialFeatureNameTranslated } from './spatial-feature-name-translated.event';
import { TranslateSpatialFeatureName } from './translate-spatial-feature-name.command';

@CommandHandler(TranslateSpatialFeatureName)
export class TranslateSpatialFeatureNameCommandHandler extends BaseUpdateCommandHandler<Point> {
    protected actOnInstance(
        instance: Point,
        { translation, languageCode }: TranslateSpatialFeatureName
    ): ResultOrError<Point> {
        return instance.translateName(translation, languageCode);
    }

    protected fetchRequiredExternalState(_command?: ICommand): Promise<InMemorySnapshot> {
        return Promise.resolve(new DeluxeInMemoryStore({}).fetchFullSnapshotInLegacyFormat());
    }

    protected validateExternalState(
        _state: InMemorySnapshot,
        _instance: Point
    ): InternalError | Valid {
        return Valid;
    }

    protected buildEvent(
        payload: TranslateSpatialFeatureName,
        eventMeta: EventRecordMetadata
    ): BaseEvent<IEventPayload> {
        const { aggregateCompositeIdentifier, languageCode, translation } = payload;

        return new SpatialFeatureNameTranslated(
            {
                aggregateCompositeIdentifier,
                translationItem: new MultilingualTextItem({
                    languageCode,
                    text: translation,
                    role: MultilingualTextItemRole.freeTranslation,
                }),
            },
            eventMeta
        );
    }
}
