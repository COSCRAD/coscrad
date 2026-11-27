import { BooleanDataType, NestedDataType, NonEmptyString } from '@coscrad/data-types';
import { isBoolean, isNonEmptyObject } from '@coscrad/validation-constraints';
import { DetailScopedCommandWriteContext } from '../../../../app/controllers/command/services/command-info-service';
import { Maybe } from '../../../../lib/types/maybe';
import { NotFound } from '../../../../lib/types/not-found';
import cloneToPlainObject from '../../../../lib/utilities/cloneToPlainObject';
import { ConnectionRecordForResourceViewModel } from '../../../../queries/buildViewModelForResource/viewModels';
import { NoteRecordForResourceViewModel } from '../../../../queries/buildViewModelForResource/viewModels/note-record-for-resource.view-model';
import { EventSourcedTagViewModel } from '../../../../queries/buildViewModelForResource/viewModels/tag.view-model.event-sourced';
import { CoscradDataExample } from '../../../../test-data/utilities';
import { DTO } from '../../../../types/DTO';
import { buildMultilingualTextWithSingleItem } from '../../../common/build-multilingual-text-with-single-item';
import { MultilingualText } from '../../../common/entities/multilingual-text';
import { AggregateId } from '../../../types/AggregateId';
import { AggregateType } from '../../../types/AggregateType';
import { ResourceType } from '../../../types/ResourceType';
import { AccessControlList } from '../../shared/access-control/access-control-list.entity';
import { SpatialFeatureProperties } from '../../spatial-feature/point/entities/spatial-feature-properties.entity';
import { GeometryViewModel } from '../../spatial-feature/queries/spatial-feature.view-model.event-sourced';
import { ContributionSummary } from '../../user-management';
import { CoscradUserWithGroups } from '../../user-management/user/entities/user/coscrad-user-with-groups';
import buildDummyUuid from '../../__tests__/utilities/buildDummyUuid';
import { GeospatialMapCompositeIdentifier } from '../commands/create-map.command';
import { MapCreated } from '../commands/map-created.event';

export class SpatialFeatureViewForMap {
    id: AggregateId;
    geometry: GeometryViewModel;
    properties: SpatialFeatureProperties;

    constructor({ id, geometry, properties }: DTO<SpatialFeatureViewForMap>) {
        this.id = id;

        // @ts-expect-error TODO fix this
        this.geometry = geometry;

        this.properties = new SpatialFeatureProperties(properties);
    }
}

@CoscradDataExample<GeospatialMapViewModel>({
    example: {
        type: ResourceType.map,
        id: buildDummyUuid(8),
        isPublished: true,
        accessControlList: new AccessControlList().toDTO(),
        name: buildMultilingualTextWithSingleItem('test map name'),
        description: buildMultilingualTextWithSingleItem('test description name'),
        tags: [],
        notes: {},
        connections: {},
        contributions: [],
        spatialFeaturesById: {},
    },
})
export class GeospatialMapViewModel implements DetailScopedCommandWriteContext {
    // @Literal
    readonly type = ResourceType.map;

    @NonEmptyString({
        label: 'id for the geospatial map',
        description: 'id for the geospatial map',
    })
    id: string;

    @NestedDataType(GeospatialMapCompositeIdentifier, {
        label: 'name',
        description: 'name for the map',
    })
    readonly name: MultilingualText;

    @BooleanDataType({
        label: 'is published',
        description: 'indicates whether this resource is available to the public',
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
    })
    contributions: ContributionSummary[];

    @NestedDataType(GeospatialMapCompositeIdentifier, {
        label: 'description',
        description: 'description for map',
    })
    readonly description: MultilingualText;

    @NestedDataType(EventSourcedTagViewModel, {
        label: 'tags',
        description: 'a summary of the tags that have been applied to this resource',
        isArray: true,
    })
    tags: EventSourcedTagViewModel[];

    notes: Record<AggregateId, NoteRecordForResourceViewModel> = {};

    connections: Record<string, ConnectionRecordForResourceViewModel>;

    // actions: string[] = [];

    // @Lookuptable
    spatialFeaturesById: Record<AggregateId, SpatialFeatureViewForMap> = {};

    constructor(viewModelDto: DTO<GeospatialMapViewModel>) {
        const {
            id,
            name,
            description,
            tags,
            notes,
            connections,
            isPublished,
            accessControlList,
            contributions,
            spatialFeaturesById,
        } = viewModelDto;

        this.id = id;

        this.isPublished = isBoolean(isPublished) ? isPublished : false;

        this.accessControlList = new AccessControlList(accessControlList);

        this.name = new MultilingualText(name);

        this.description = new MultilingualText(description);

        this.tags = Array.isArray(tags) ? tags.map((t) => new EventSourcedTagViewModel(t)) : [];

        this.notes = isNonEmptyObject(notes) ? cloneToPlainObject(notes) : {};

        this.contributions = Array.isArray(contributions)
            ? contributions.map((c) => ContributionSummary.fromDto(c))
            : [];

        this.connections = isNonEmptyObject(connections) ? cloneToPlainObject(connections) : {};

        Object.entries(spatialFeaturesById || {}).forEach(
            ([spatialFeatureId, spatialFeatureDto]) => {
                this.spatialFeaturesById[spatialFeatureId] = new SpatialFeatureViewForMap(
                    spatialFeatureDto
                );
            }
        );
    }

    /**
     * Note that we are not currently using the dynamic command panel. The
     * main reason we abondoned this is that it didn't make for a good UX due
     * to missing context when we rendered forms. Currently we rely 100% on out-of-band knowledge
     * to build the admin client. But we may want to improve the dynamic command form design by binding
     * command forms to deeply nested properties so that the user doesn't need to enter information such
     * as `pageIdentifier`, `targetTranscriptLineItem`, etc.
     */
    getAvailableCommands(): string[] {
        const allActions: string[] = [];

        if (this.isPublished) {
            allActions.push('UNPUBLISH_RESOURCE');
        } else {
            allActions.push('PUBLISH_RESOURCE');
        }

        return allActions;
    }

    getCompositeIdentifier(): { type: AggregateType; id: string } {
        throw new Error('Method not implemented.');
    }

    public forUser(userWithGroups: CoscradUserWithGroups): Maybe<GeospatialMapViewModel> {
        if (this.isPublished || this.accessControlList.canUserWithGroups(userWithGroups)) {
            // TODO convert to a DTO and remove private props here

            Object.assign(this, {
                actions: this.getAvailableCommands(),
            });

            return this;
        }

        return NotFound;
    }

    // TODO can we have some kind of warning if we get the casing wrong on ~~fromDTO~~  -> `fromDto`?
    static fromDto(dto: DTO<GeospatialMapViewModel>): GeospatialMapViewModel {
        return new GeospatialMapViewModel(dto);
    }

    static fromMapCreated(event: MapCreated): GeospatialMapViewModel {
        const {
            payload: {
                aggregateCompositeIdentifier: { id },
                name,
                description,
            },
        } = event;

        const instance = new GeospatialMapViewModel({
            id,
            type: AggregateType.map,
            name: buildMultilingualTextWithSingleItem(name.text, name.languageCode),
            description: buildMultilingualTextWithSingleItem(
                description.text,
                description.languageCode
            ),
            isPublished: false,
            accessControlList: new AccessControlList(),
            spatialFeaturesById: {},
            contributions: [],
            connections: {},
            tags: [],
            notes: {},
        });

        return instance;
    }
}
