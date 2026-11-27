import {
    AggregateType,
    GeometricFeatureType,
    IMultilingualText,
    ISpatialFeatureProperties,
    ResourceType,
} from '@coscrad/api-interfaces';
import { BooleanDataType, FromDomainModel, NestedDataType } from '@coscrad/data-types';
import { isNonEmptyObject } from '@coscrad/validation-constraints';
import { ApiProperty } from '@nestjs/swagger';
import { buildMultilingualTextWithSingleItem } from '../../../../domain/common/build-multilingual-text-with-single-item';
import { MultilingualText } from '../../../../domain/common/entities/multilingual-text';
import { Aggregate } from '../../../../domain/models/aggregate.entity';
import { AccessControlList } from '../../../../domain/models/shared/access-control/access-control-list.entity';
import { ContributionSummary } from '../../../../domain/models/user-management';
import { AggregateId } from '../../../../domain/types/AggregateId';

import { ISpatialFeature } from '../../../../domain/models/spatial-feature/interfaces/spatial-feature.interface';
import { SpatialFeatureCompositeIdentifier } from '../../../../domain/models/spatial-feature/point/commands';
import buildDummyUuid from '../../../../domain/models/__tests__/utilities/buildDummyUuid';
import { Ctor } from '../../../../lib/types/Ctor';
import cloneToPlainObject from '../../../../lib/utilities/cloneToPlainObject';
import { CoscradDataExample } from '../../../../test-data/utilities';
import { DTO } from '../../../../types/DTO';
import { ConnectionRecordForResourceViewModel } from '../connection-record-for-resource.view-model';
import { NoteRecordForResourceViewModel } from '../note-record-for-resource.view-model';
import { EventSourcedTagViewModel } from '../tag.view-model.event-sourced';
import { ViewModelId } from '../types/ViewModelId';

type PointTuple = [number, number];

type GeometryViewModel = {
    type: GeometricFeatureType;
    coordinates: PointTuple | PointTuple[] | PointTuple[][];
};

/**
 * We have a single `SpatialFeatureViewModel` and  deal with
 * discriminating the union client-side.
 */
@CoscradDataExample<SpatialFeatureViewModel>({
    example: {
        type: AggregateType.spatialFeature,
        id: buildDummyUuid(6),
        isPublished: false,
        accessControlList: AccessControlList.buildEmpty(),
        notes: {},
        connections: {},
        // TODO these should be objects, too!
        contributions: [],
        tags: [],
        name: {
            items: [],
        },
        geometry: {
            type: GeometricFeatureType.point,
            coordinates: [52, -123],
        },
        properties: {
            name: buildMultilingualTextWithSingleItem('my creek'),
            description: buildMultilingualTextWithSingleItem('a nice little town'),
        },
    },
})
export class SpatialFeatureViewModel {
    readonly type = ResourceType.spatialFeature;

    // TODO extend a base view model
    @ApiProperty({
        example: '12',
        description: 'uniquely identifies an entity from other entities of the same type',
    })
    @FromDomainModel(Aggregate as unknown as Ctor<unknown>)
    readonly id: ViewModelId;

    @NestedDataType(MultilingualText, {
        description: `multilingual text name of the entity`,
        label: `name`,
    })
    readonly name: IMultilingualText;

    @BooleanDataType({
        label: 'is published',
        description: 'indicates whether this resource available to the public',
    })
    isPublished: boolean;

    @NestedDataType(AccessControlList, {
        label: 'access control list',
        description: 'includes lists of IDs for users and user groups who can read this resource',
        isPrivate: true,
    })
    accessControlList: AccessControlList;

    @NestedDataType(ContributionSummary, {
        label: 'contributions',
        description: 'a list of all contributions to the development of this resource',
        // Can't we get this from reflection?
        isArray: true,
    })
    contributions: ContributionSummary[];

    @NestedDataType(EventSourcedTagViewModel, {
        label: 'tags',
        description: 'a summary of the tags that have been applied to this resource',
        isArray: true,
    })
    tags: EventSourcedTagViewModel[];

    // TODO @LookupTable
    // @NestedDataType(NoteRecordForResourceViewModel, {
    //     label: 'notes',
    //     description: 'a list of contextualized notes about this resource',
    //     isArray: true,
    // })
    notes: Record<AggregateId, NoteRecordForResourceViewModel> = {};

    // TODO @LookupTable
    // @NestedDataType(ConnectionRecordForResourceViewModel, {
    //     label: 'connections',
    //     description: 'a list of contextualized connections to other resources about with a note',
    //     isArray: true,
    // })
    connections: Record<string, ConnectionRecordForResourceViewModel>;

    /**
     * We may need to make this a class so we can generate the API docs.
     */
    readonly geometry: GeometryViewModel;

    /**
     * This name is in keeping with the GEOJSON standard. It holds all non-geometry
     * properties that are associated with the identity of this spatial feature.
     */
    readonly properties: ISpatialFeatureProperties;

    constructor(viewModelDto: DTO<SpatialFeatureViewModel>) {
        const {
            geometry,
            properties,
            id,
            name,
            isPublished,
            accessControlList,
            contributions,
            tags,
            notes,
            connections,
        } = viewModelDto;

        this.id = id;

        this.isPublished = Boolean(isPublished);

        this.accessControlList = isNonEmptyObject(accessControlList)
            ? new AccessControlList(accessControlList)
            : AccessControlList.buildEmpty();

        this.name = new MultilingualText(name);

        this.geometry = cloneToPlainObject(geometry);

        this.properties = cloneToPlainObject(properties);

        this.contributions = contributions.map((c) => ContributionSummary.fromDto(c));

        this.tags = Array.isArray(tags) ? tags.map((t) => new EventSourcedTagViewModel(t)) : [];

        this.notes = isNonEmptyObject(notes) ? cloneToPlainObject(notes) : {};

        this.connections = isNonEmptyObject(connections) ? cloneToPlainObject(connections) : {};
    }

    getCompositeIdentifier(): SpatialFeatureCompositeIdentifier {
        return {
            type: AggregateType.spatialFeature,
            id: this.id,
        };
    }

    static fromDto(dto: DTO<SpatialFeatureViewModel>): SpatialFeatureViewModel {
        return new SpatialFeatureViewModel(dto);
    }

    // TODO remove this once the control \ query service have been rewritten
    static fromDomainModel(_domainModel: ISpatialFeature): SpatialFeatureViewModel {
        throw new Error('not implemented');
    }
}
