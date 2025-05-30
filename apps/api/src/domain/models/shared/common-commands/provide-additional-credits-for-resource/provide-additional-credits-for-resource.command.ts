import {
    AGGREGATE_COMPOSITE_IDENTIFIER,
    AggregateCompositeIdentifier,
    ICommandBase,
    ResourceType,
} from '@coscrad/api-interfaces';
import { Command } from '@coscrad/commands';
import { NestedDataType, NonEmptyString, UUID } from '@coscrad/data-types';
import { AggregateId } from '../../../../../domain/types/AggregateId';
import { CoscradDataExample } from '../../../../../test-data/utilities';
import { DTO } from '../../../../../types/DTO';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';

class ResourceCompositeIdentifier {
    /**
     * Note that the use of `NonEmptyString` in the constraint is intentional
     * here to allow tests with non-standard resource types. We need to
     * decide how to handle this.
     */
    @NonEmptyString({
        label: 'resource type',
        description: 'the type of this resource',
    })
    type: ResourceType;

    @UUID({
        label: 'ID',
        description: 'unique identifier',
    })
    id: AggregateId;
}

@CoscradDataExample<ProvideAdditionalCreditsForResource>({
    example: {
        aggregateCompositeIdentifier: {
            type: ResourceType.song,
            id: buildDummyUuid(55),
        },
        contributionType: 'Audio processed',
        contributorIds: [],
    },
})
@Command({
    type: 'PROVIDE_ADDITIONAL_CREDITS_FOR_RESOURCE',
    label: 'Provide Additional Credits',
    description:
        'Provide explicit credits that will be shown in addition to the system generated credits for this resource',
})
export class ProvideAdditionalCreditsForResource implements ICommandBase {
    @NestedDataType(ResourceCompositeIdentifier, {
        label: 'composite ID',
        description: 'system-wide identifier for a resource',
    })
    [AGGREGATE_COMPOSITE_IDENTIFIER]: AggregateCompositeIdentifier;

    @NonEmptyString({
        label: 'contribution type',
        description: 'For example, "Song composed"',
    })
    contributionType: string;

    @UUID({
        label: 'contributor IDs',
        description:
            'list of system references to the contributors who contributed this work or information',
        isArray: true,
        isOptional: false,
    })
    /**
     * Note that this is distinct from the `contributorIds` that will show up on the
     * event meta. The contributors on the meta are responsible for creating
     * the acknowledgement of work, whereas the contributors on the payload
     * are the ones who did the work.
     */
    contributorIds: AggregateId[];

    /**
     * TODO Can't we avoid this?
     */
    static fromDto(dto: DTO<ProvideAdditionalCreditsForResource>) {
        const out = new ProvideAdditionalCreditsForResource();

        if (!dto) {
            return;
        }

        const { aggregateCompositeIdentifier, contributionType, contributorIds } = dto;

        out[AGGREGATE_COMPOSITE_IDENTIFIER] = aggregateCompositeIdentifier;

        out.contributionType = contributionType;

        out.contributorIds = contributorIds;

        return out;
    }
}
