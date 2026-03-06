import {
    AggregateType,
    GeometricFeatureType,
    MultilingualTextItemRole,
} from '@coscrad/api-interfaces';
import { CommandHandler } from '@coscrad/commands';
import { isNonEmptyObject } from '@coscrad/validation-constraints';
import { buildMultilingualTextWithSingleItem } from '../../../../../domain/common/build-multilingual-text-with-single-item';
import { MultilingualTextItem } from '../../../../../domain/common/entities/multilingual-text';
import { InternalError } from '../../../../../lib/errors/InternalError';
import { ResultOrError } from '../../../../../types/ResultOrError';
import { Valid } from '../../../../domainModelValidators/Valid';
import { DeluxeInMemoryStore } from '../../../../types/DeluxeInMemoryStore';
import { InMemorySnapshot } from '../../../../types/ResourceType';
import { BaseCreateCommandHandler } from '../../../shared/command-handlers/base-create-command-handler';
import { BaseEvent } from '../../../shared/events/base-event.entity';
import { EventRecordMetadata } from '../../../shared/events/types/EventRecordMetadata';
import { Point } from '../entities/point.entity';
import { CreatePoint } from './create-point.command';
import { PointCreated, PointCreatedPayload } from './point-created.event';

@CommandHandler(CreatePoint)
export class CreatePointCommandHandler extends BaseCreateCommandHandler<Point> {
    protected createNewInstance({
        aggregateCompositeIdentifier: { id },
        traditionalName,
        contemporaryName,
        lattitude,
        longitude,
        // TODO remove this
        // name,
        description,
        imageUrl,
    }: CreatePoint): ResultOrError<Point> {
        const tradionalNameToUse = isNonEmptyObject(traditionalName)
            ? buildMultilingualTextWithSingleItem(
                  traditionalName.text,
                  traditionalName.languageCode
              )
            : null;

        const contemporaryNameToUse = isNonEmptyObject(contemporaryName)
            ? buildMultilingualTextWithSingleItem(
                  contemporaryName.text,
                  contemporaryName.languageCode
              )
            : null;

        const instance = new Point({
            type: AggregateType.spatialFeature,
            id,
            geometry: {
                type: GeometricFeatureType.point,
                coordinates: [lattitude, longitude],
            },
            properties: {
                traditionalName: tradionalNameToUse,
                contemporaryName: contemporaryNameToUse,
                description,
                imageUrl,
            },
            // You must run a `PUBLISH_RESOURCE` command to publish this point
            published: false,
        });

        const validationResult = instance.validateInvariants();

        if (validationResult !== Valid) {
            return new InternalError(`Failed to create point/${id}.`, [validationResult]);
        }

        return instance;
    }

    protected async fetchRequiredExternalState(_?: CreatePoint): Promise<InMemorySnapshot> {
        return new DeluxeInMemoryStore({}).fetchFullSnapshotInLegacyFormat();
    }

    protected validateExternalState(
        _externalState: InMemorySnapshot,
        _point: Point
    ): InternalError | Valid {
        /**
         * We do not require place names to be unique.
         */
        return Valid;
    }

    protected buildEvent(command: CreatePoint, eventMeta: EventRecordMetadata): BaseEvent {
        const eventPayload: PointCreatedPayload = {
            ...command,
            traditionalName: command.traditionalName
                ? new MultilingualTextItem({
                      ...command.traditionalName,
                      role: MultilingualTextItemRole.original,
                  })
                : undefined,
            contemporaryName: command.traditionalName
                ? new MultilingualTextItem({
                      ...command.contemporaryName,
                      role: MultilingualTextItemRole.original,
                  })
                : undefined,
        };

        return new PointCreated(eventPayload, eventMeta);
    }
}
