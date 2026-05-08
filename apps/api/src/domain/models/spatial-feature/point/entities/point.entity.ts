import { AggregateType } from '@coscrad/api-interfaces';
import { isDeepStrictEqual } from 'util';
import { RegisterIndexScopedCommands } from '../../../../../app/controllers/command/command-info/decorators/register-index-scoped-commands.decorator';
import { AggregateId } from '../../../../../domain/types/AggregateId';
import { InternalError, isInternalError } from '../../../../../lib/errors/InternalError';
import { ValidationResult } from '../../../../../lib/errors/types/ValidationResult';
import { Maybe } from '../../../../../lib/types/maybe';
import formatAggregateCompositeIdentifier from '../../../../../queries/presentation/formatAggregateCompositeIdentifier';
import { DTO } from '../../../../../types/DTO';
import { ResultOrError } from '../../../../../types/ResultOrError';
import { buildMultilingualTextWithSingleItem } from '../../../../common/build-multilingual-text-with-single-item';
import { MultilingualText } from '../../../../common/entities/multilingual-text';
import { Valid } from '../../../../domainModelValidators/Valid';
import { AggregateCompositeIdentifier } from '../../../../types/AggregateCompositeIdentifier';
import { DeluxeInMemoryStore } from '../../../../types/DeluxeInMemoryStore';
import { InMemorySnapshot, ResourceType } from '../../../../types/ResourceType';
import {
    buildAggregateRootFromEventHistory,
    CreationEventHandlerMap,
} from '../../../build-aggregate-root-from-event-history';
import { Resource } from '../../../resource.entity';
import InvalidExternalStateError from '../../../shared/common-command-errors/InvalidExternalStateError';
import { BaseEvent } from '../../../shared/events/base-event.entity';
import { GeometricFeature } from '../../Geometric-Feature';
import { ISpatialFeature } from '../../interfaces/spatial-feature.interface';
import validatePosition2D from '../../validation/validatePosition2D';
import { CREATE_POINT, PointCreated } from '../commands';
import { SpatialFeatureProperties } from './spatial-feature-properties.entity';

@RegisterIndexScopedCommands([CREATE_POINT])
export class Point extends Resource implements ISpatialFeature {
    readonly type = ResourceType.spatialFeature;

    readonly geometry: GeometricFeature;

    readonly properties: SpatialFeatureProperties;

    constructor(dto: DTO<Point>) {
        super({ ...dto, type: ResourceType.spatialFeature });

        if (!dto) return;

        const { geometry: geometryDTO, properties: propertiesDTO } = dto;

        /**
         * We use a plain-old object here to minimize maintenance and readability
         * issues that come with additional layers of OOP. Nonetheless, we deep
         * clone to avoid shared references and hence unwanted side-effects.
         */
        this.geometry = new GeometricFeature(geometryDTO);

        this.properties = new SpatialFeatureProperties(propertiesDTO);
    }

    getName(): MultilingualText {
        return this.properties.name;
    }

    validateExternalState(externalState: InMemorySnapshot): ValidationResult {
        const otherSpatialFeatures = new DeluxeInMemoryStore(externalState).fetchAllOfType(
            AggregateType.spatialFeature
        );

        const spatialFeaturesWithTheSameName = otherSpatialFeatures.filter((sf) => {
            const thisName = this.getName().getOriginalTextItem();

            const thatName = sf.getName().getOriginalTextItem();

            return isDeepStrictEqual(thisName, thatName);
        });

        const nameDuplicationErrors = spatialFeaturesWithTheSameName.map(
            (spatialFeature) =>
                new InternalError(
                    `There is already a spatialFeature with the name: ${spatialFeature
                        .getName()
                        .getOriginalTextItem()}`
                )
        );

        return nameDuplicationErrors.length > 0
            ? new InvalidExternalStateError(nameDuplicationErrors)
            : Valid;
    }

    protected validateComplexInvariants(): InternalError[] {
        const { coordinates } = this.geometry;

        /**
         * Note that **all** invariant validation rules are validated within
         * the following function. We opt-out of the decorator-based
         * 'simple-invariant' validation for geometric models because it is
         *  more transparent to keep all coordinates as plain-old objects and not
         * instances of nested classes.
         */
        return validatePosition2D(coordinates);
    }

    // Should we have a base class? Does this logic vary amongst subtypes?
    protected getExternalReferences(): AggregateCompositeIdentifier[] {
        return [];
    }

    protected getResourceSpecificAvailableCommands(): string[] {
        return [];
    }

    static fromEventHistory(
        eventHistory: BaseEvent[],
        id: AggregateId
    ): Maybe<ResultOrError<Point>> {
        const creationEventHandlerMap: CreationEventHandlerMap<Point> = new Map().set(
            'POINT_CREATED',
            Point.buildPointFromPointCreated
        );

        return buildAggregateRootFromEventHistory(
            creationEventHandlerMap,
            {
                type: AggregateType.spatialFeature,
                id,
            },
            eventHistory
        );
    }

    static buildPointFromPointCreated({
        payload: {
            aggregateCompositeIdentifier: { id },
            location: coordinates,
            name,
            description,
        },
    }: PointCreated): ResultOrError<Point> {
        const buildResult = new Point({
            type: AggregateType.spatialFeature,
            id,
            geometry: new GeometricFeature(coordinates),
            properties: {
                name: buildMultilingualTextWithSingleItem(name.text, name.languageCode),
                description: buildMultilingualTextWithSingleItem(
                    description.text,
                    description.languageCode
                ),
            },
            published: false,
        });

        const invariantValidationResult = buildResult.validateInvariants();

        if (isInternalError(invariantValidationResult)) {
            throw new InternalError(
                `Failed to build point: ${formatAggregateCompositeIdentifier({
                    type: AggregateType.spatialFeature,
                    id,
                })} from event history`,
                [invariantValidationResult]
            );
        }

        return buildResult;
    }
}
