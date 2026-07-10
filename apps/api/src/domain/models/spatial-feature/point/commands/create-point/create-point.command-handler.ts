import {
    AggregateType,
    GeometricFeatureType,
    LanguageCode,
    MultilingualTextItemRole,
    ResourceType,
} from '@coscrad/api-interfaces';
import { CommandHandler } from '@coscrad/commands';
import { InternalError } from '../../../../../../lib/errors/InternalError';
import { ResultOrError } from '../../../../../../types/ResultOrError';
import { buildMultilingualTextWithSingleItem } from '../../../../../common/build-multilingual-text-with-single-item';
import { MultilingualTextItem } from '../../../../../common/entities/multilingual-text';
import { Valid } from '../../../../../domainModelValidators/Valid';
import { DeluxeInMemoryStore } from '../../../../../types/DeluxeInMemoryStore';
import { InMemorySnapshot } from '../../../../../types/ResourceType';
import { BaseCreateCommandHandler } from '../../../../shared/command-handlers/base-create-command-handler';
import { BaseEvent } from '../../../../shared/events/base-event.entity';
import { EventRecordMetadata } from '../../../../shared/events/types/EventRecordMetadata';
import { validAggregateOrThrow } from '../../../../shared/functional';
import { GeometricFeature } from '../../../Geometric-Feature';
import { PointCoordinates } from '../../entities/point-coordinates.entity';
import { Point } from '../../entities/point.entity';
import { CreatePoint } from './create-point.command';
import { PointCreated, PointCreatedPayload } from './point-created.event';

@CommandHandler(CreatePoint)
export class CreatePointCommandHandler extends BaseCreateCommandHandler<Point> {
    protected createNewInstance({
        aggregateCompositeIdentifier: { id },
        lattitude,
        longitude,
        name,
        languageCodeForName,
        description,
    }: CreatePoint): ResultOrError<Point> {
        return new Point({
            type: AggregateType.spatialFeature,
            id,
            geometry: {
                type: GeometricFeatureType.point,
                coordinates: PointCoordinates.fromTuple([lattitude, longitude]),
            },
            properties: {
                name: buildMultilingualTextWithSingleItem(name, languageCodeForName),
                alternativeNamesByLabel: {},
                description: buildMultilingualTextWithSingleItem(description),
            },
            // You must run a `PUBLISH_RESOURCE` command to publish this point
            published: false,
        });
    }

    protected async fetchRequiredExternalState(_?: CreatePoint): Promise<InMemorySnapshot> {
        const allSpatialFeatures =
            /**
         * We need to fetch only the spatial features with the same name. This is a bit
        awkward given that we use event sourcing, but it's an important optimization. If we
        don't do this, it will get slower and slower to add spatial features as their count in the DB grows.
         */
            (
                await this.repositoryProvider.forResource(ResourceType.spatialFeature).fetchMany()
            ).filter(validAggregateOrThrow);

        return new DeluxeInMemoryStore({
            [AggregateType.spatialFeature]: allSpatialFeatures,
        }).fetchFullSnapshotInLegacyFormat();
    }

    protected validateExternalState(
        externalState: InMemorySnapshot,
        point: Point
    ): InternalError | Valid {
        return point.validateExternalState(externalState);
    }

    protected buildEvent(command: CreatePoint, eventMeta: EventRecordMetadata): BaseEvent {
        const eventPayload: PointCreatedPayload = {
            aggregateCompositeIdentifier: command.aggregateCompositeIdentifier,
            geometricFeature: new GeometricFeature({
                type: GeometricFeatureType.point,
                // TODO descctructure
                coordinates: PointCoordinates.fromTuple([command.lattitude, command.longitude]),
            }),
            name: new MultilingualTextItem({
                languageCode: command.languageCodeForName,
                text: command.name,
                role: MultilingualTextItemRole.original,
            }),
            description: new MultilingualTextItem({
                text: command.description,
                languageCode: LanguageCode.English,
                role: MultilingualTextItemRole.original,
            }),
        };

        return new PointCreated(eventPayload, eventMeta);
    }
}
