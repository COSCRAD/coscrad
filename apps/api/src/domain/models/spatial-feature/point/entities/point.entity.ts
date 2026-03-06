import { AggregateType, LanguageCode } from '@coscrad/api-interfaces';
import { NestedDataType } from '@coscrad/data-types';
import { isNumberWithinRange } from '@coscrad/validation-constraints';
import { RegisterIndexScopedCommands } from '../../../../../app/controllers/command/command-info/decorators/register-index-scoped-commands.decorator';
import { buildMultilingualTextWithSingleItem } from '../../../../../domain/common/build-multilingual-text-with-single-item';
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
import { InMemorySnapshot, ResourceType } from '../../../../types/ResourceType';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import {
    CreationEventHandlerMap,
    buildAggregateRootFromEventHistory,
} from '../../../build-aggregate-root-from-event-history';
import { Resource } from '../../../resource.entity';
import { BaseEvent } from '../../../shared/events/base-event.entity';
import { IGeometricFeature } from '../../interfaces/geometric-feature.interface';
import { ISpatialFeature } from '../../interfaces/spatial-feature.interface';
import { PointCoordinates } from '../../types/Coordinates/PointCoordinates';
import validatePosition2D from '../../validation/validatePosition2D';
import { CREATE_POINT, PointCreated } from '../commands';
import { SpatialFeatureProperties } from './spatial-feature-properties.entity';

const POINT = 'Point';

@CoscradDataExample<Point>({
    example: {
        type: ResourceType.spatialFeature,
        geometry: { type: POINT, coordinates: [80, 120] },
        properties: { description: 'this is my favourite place' },
        published: false,
        id: buildDummyUuid(21),
    },
})
@RegisterIndexScopedCommands([CREATE_POINT])
export class Point extends Resource implements ISpatialFeature {
    readonly type = ResourceType.spatialFeature;

    readonly geometry: IGeometricFeature<'Point', PointCoordinates>;

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
            geometryDTO as IGeometricFeature<'Point', PointCoordinates>
        );

        this.properties = new SpatialFeatureProperties(propertiesDTO);
    }

    getName(): MultilingualText {
        return this.properties.getName();
    }

    validateExternalState(_externalState: InMemorySnapshot): ValidationResult {
        return Valid;
    }

    protected validateComplexInvariants(): InternalError[] {
        const allErrors: InternalError[] = [];

        const { coordinates } = this.geometry;

        /**
         * TODO Does this mean the nested `Properties` should run its own schema-based validation?
         * We should fuzz-test this model.
         *
         * Note that **all** invariant validation rules are validated within
         * the following function. We opt-out of the decorator-based
         * 'simple-invariant' validation for geometric models because it is
         *  more transparent to keep all coordinates as plain-old objects and not
         * instances of nested classes.
         */
        allErrors.push(...validatePosition2D(coordinates));

        const [lattitude, longitude] = coordinates;

        if (!isNumberWithinRange(lattitude, [-90, 90])) {
            allErrors.push(
                new InternalError(
                    `Invalid lattiduue: ${lattitude} encountered for point(${
                        this.id
                    }) ${this.getName()}. Lattitude must fall between -90 and 90`
                )
            );
        }

        if (!isNumberWithinRange(longitude, [-180, 180])) {
            allErrors.push(
                new InternalError(
                    `Invalid longitude: ${longitude} encountered for point(${this.id}). Longitude must fall between -180 and 180.`
                )
            );
        }

        allErrors.push(...this.properties.validateComplexInvariants());

        return allErrors;
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
            traditionalName,
            contemporaryName,
            description,
        },
    }: PointCreated): ResultOrError<Point> {
        const buildResult = new Point({
            type: AggregateType.spatialFeature,
            id,
            geometry: {
                type: POINT,
                coordinates: [lattitude, longitude],
            },
            properties: {
                traditionalName: traditionalName
                    ? buildMultilingualTextWithSingleItem(
                          traditionalName.text,
                          traditionalName.languageCode
                      )
                    : undefined,
                contemporaryName: contemporaryName
                    ? buildMultilingualTextWithSingleItem(
                          contemporaryName.text,
                          contemporaryName.languageCode
                      )
                    : undefined,
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
