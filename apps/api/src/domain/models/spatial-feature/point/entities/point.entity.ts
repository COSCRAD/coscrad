import { AggregateType, GeometricFeatureType, LanguageCode } from '@coscrad/api-interfaces';
import { isDeepStrictEqual } from 'util';
import { RegisterIndexScopedCommands } from '../../../../../app/controllers/command/command-info/decorators/register-index-scoped-commands.decorator';
import { AggregateRoot, UpdateMethod } from '../../../../../domain/decorators';
import { AggregateId } from '../../../../../domain/types/AggregateId';
import { InternalError, isInternalError } from '../../../../../lib/errors/InternalError';
import { ValidationResult } from '../../../../../lib/errors/types/ValidationResult';
import { Maybe } from '../../../../../lib/types/maybe';
import formatAggregateCompositeIdentifier from '../../../../../queries/presentation/formatAggregateCompositeIdentifier';
import { buildTestInstance, CoscradDataExample } from '../../../../../test-data/utilities';
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
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import { GeometricFeature } from '../../Geometric-Feature';
import { ISpatialFeature } from '../../interfaces/spatial-feature.interface';
import { AlternativeNameAddedForSpatialFeature } from '../commands/add-alternative-name-for-spatial-feature/alternative-name-added-for-spatial-feature.event';
import { CREATE_POINT, PointCreated } from '../commands/create-point';
import { SpatialFeatureNameTranslated } from '../commands/translate-spatial-feature-name/spatial-feature-name-translated.event';
import { PointCoordinates } from './point-coordinates.entity';
import { SpatialFeatureProperties } from './spatial-feature-properties.entity';

@CoscradDataExample<Point>({
    example: {
        type: ResourceType.spatialFeature,
        published: false,
        id: buildDummyUuid(123),
        geometry: buildTestInstance(GeometricFeature, {
            type: GeometricFeatureType.point,
            coordinates: PointCoordinates.fromTuple([22, -55]),
        }),
        properties: {
            description: buildMultilingualTextWithSingleItem('The place to be!'),
            name: buildMultilingualTextWithSingleItem('My Point'),
            alternativeNamesByLabel: {},
        },
    },
})
@RegisterIndexScopedCommands([CREATE_POINT])
@AggregateRoot(AggregateType.spatialFeature)
export class Point extends Resource implements ISpatialFeature {
    readonly type = ResourceType.spatialFeature;

    readonly geometry: GeometricFeature;

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
        const coordinateInvariantErrors = this.geometry.coordinates.validateComplexInvariants();

        return coordinateInvariantErrors;
    }

    // Should we have a base class? Does this logic vary amongst subtypes?
    protected getExternalReferences(): AggregateCompositeIdentifier[] {
        return [];
    }

    protected getResourceSpecificAvailableCommands(): string[] {
        return [];
    }

    @UpdateMethod()
    translateName(translation: string, languageCode: LanguageCode) {
        const updatedProperties = this.properties.translateName(translation, languageCode);

        if (isInternalError(updatedProperties)) {
            return updatedProperties;
        }

        this.properties = updatedProperties;

        return this;
    }

    addAlternativeName(label: string, text: string, languageCode: LanguageCode) {
        const updatedProperties = this.properties.addAlternativeName(label, text, languageCode);

        if (isInternalError(updatedProperties)) {
            return updatedProperties;
        }

        this.properties = updatedProperties;

        return this;
    }

    handleSpatialFeatureNameTranslated({
        payload: {
            translationItem: { text, languageCode },
        },
    }: SpatialFeatureNameTranslated) {
        return this.translateName(text, languageCode);
    }

    handleAlternativeNameAddedForSpatialFeature({
        payload: {
            label,
            textItem: { text, languageCode },
        },
    }: AlternativeNameAddedForSpatialFeature) {
        const result = this.addAlternativeName(label, text, languageCode);

        return result;
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
            geometricFeature: coordinates,
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
                alternativeNamesByLabel: {},
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
