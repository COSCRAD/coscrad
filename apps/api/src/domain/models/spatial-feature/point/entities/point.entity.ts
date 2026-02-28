import { AggregateType, LanguageCode } from '@coscrad/api-interfaces';
import { NestedDataType } from '@coscrad/data-types';
import { isDeepStrictEqual } from 'util';
import { RegisterIndexScopedCommands } from '../../../../../app/controllers/command/command-info/decorators/register-index-scoped-commands.decorator';
import { UpdateMethod } from '../../../../../domain/decorators';
import { AggregateId } from '../../../../../domain/types/AggregateId';
import { InternalError, isInternalError } from '../../../../../lib/errors/InternalError';
import { ValidationResult } from '../../../../../lib/errors/types/ValidationResult';
import { Maybe } from '../../../../../lib/types/maybe';
import cloneToPlainObject from '../../../../../lib/utilities/cloneToPlainObject';
import formatAggregateCompositeIdentifier from '../../../../../queries/presentation/formatAggregateCompositeIdentifier';
import { CoscradDataExample } from '../../../../../test-data/utilities';
import { DTO } from '../../../../../types/DTO';
import { ResultOrError } from '../../../../../types/ResultOrError';
import { MultilingualText } from '../../../../common/entities/multilingual-text';
import { Valid } from '../../../../domainModelValidators/Valid';
import { AggregateCompositeIdentifier } from '../../../../types/AggregateCompositeIdentifier';
import { DeluxeInMemoryStore } from '../../../../types/DeluxeInMemoryStore';
import { InMemorySnapshot, ResourceType } from '../../../../types/ResourceType';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import {
    CreationEventHandlerMap,
    buildAggregateRootFromEventHistory,
} from '../../../build-aggregate-root-from-event-history';
import { Resource } from '../../../resource.entity';
import InvalidExternalStateError from '../../../shared/common-command-errors/InvalidExternalStateError';
import { BaseEvent } from '../../../shared/events/base-event.entity';
import { IGeometricFeature } from '../../interfaces/geometric-feature.interface';
import { ISpatialFeature } from '../../interfaces/spatial-feature.interface';
import { PointCoordinates } from '../../types/Coordinates/PointCoordinates';
import { GeometricFeatureType } from '../../types/GeometricFeatureType';
import validatePosition2D from '../../validation/validatePosition2D';
import { CREATE_POINT, PointCreated } from '../commands';
import { SpatialFeatureProperties } from './spatial-feature-properties.entity';

@CoscradDataExample<Point>({
    example: {
        type: ResourceType.spatialFeature,
        geometry: { type: GeometricFeatureType.point, coordinates: [120, 80] },
        properties: { description: 'this is my favourite place' },
        published: false,
        id: buildDummyUuid(21),
    },
})
@RegisterIndexScopedCommands([CREATE_POINT])
export class Point extends Resource implements ISpatialFeature {
    readonly type = ResourceType.spatialFeature;

    readonly geometry: IGeometricFeature<typeof GeometricFeatureType.point, PointCoordinates>;

    @NestedDataType(SpatialFeatureProperties, {
        label: 'properties',
        description: 'custom properties to supplement the geospatial data',
    })
    properties: SpatialFeatureProperties;

    constructor(dto: DTO<Point>) {
        super({ ...dto, type: ResourceType.spatialFeature });

        if (!dto) return;

        const { geometry: geometryDTO, properties: propertiesDTO } = dto;

        /**
         * We use a plain-old object here to minimize maintenance and readability
         * issues that come with additional layers of OOP. Nonetheless, we deep
         * clone to avoid shared references and hence unwanted side-effects.
         */
        this.geometry = cloneToPlainObject(
            geometryDTO as IGeometricFeature<typeof GeometricFeatureType.point, PointCoordinates>
        );

        this.properties = new SpatialFeatureProperties(propertiesDTO);
    }

    getName(): MultilingualText {
        return this.properties.getName();
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

    @UpdateMethod()
    addTraditionalName(text: string, languageCode: LanguageCode): ResultOrError<Point> {
        const updatedProperties = this.properties.addTraditionalName(text, languageCode);

        if (isInternalError(updatedProperties)) {
            return updatedProperties;
        }

        this.properties = updatedProperties;

        return this;
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
            lattitude,
            longitude,
            description,
        },
    }: PointCreated): ResultOrError<Point> {
        const buildResult = new Point({
            type: AggregateType.spatialFeature,
            id,
            geometry: {
                type: GeometricFeatureType.point,
                coordinates: [lattitude, longitude],
            },
            properties: {
                description,
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
