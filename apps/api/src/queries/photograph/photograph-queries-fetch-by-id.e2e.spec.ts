import { AggregateType, CoscradUserRole, LanguageCode } from '@coscrad/api-interfaces';
import getValidAggregateInstanceForTest from '../../domain/__tests__/utilities/getValidAggregateInstanceForTest';
import buildDummyUuid from '../../domain/models/__tests__/utilities/buildDummyUuid';
import { PhotographCreated } from '../../domain/models/photograph';
import { AccessControlList } from '../../domain/models/shared/access-control/access-control-list.entity';
import { CoscradContributor } from '../../domain/models/user-management/contributor';
import { CoscradUserGroup } from '../../domain/models/user-management/group/entities/coscrad-user-group.entity';
import { CoscradUserWithGroups } from '../../domain/models/user-management/user/entities/user/coscrad-user-with-groups';
import { CoscradUser } from '../../domain/models/user-management/user/entities/user/coscrad-user.entity';
import { FullName } from '../../domain/models/user-management/user/entities/user/full-name.entity';
import { AggregateId } from '../../domain/types/AggregateId';
import { clonePlainObjectWithOverrides } from '../../lib/utilities/clonePlainObjectWithOverrides';
import buildTestDataInFlatFormat from '../../test-data/buildTestDataInFlatFormat';
import { TestEventStream } from '../../test-data/events';
import { BaseResourceViewModel } from '../buildViewModelForResource/viewModels/base-resource.view-model';

// Set up endpoints: index endpoint, id endpoint
const indexEndpoint = `/resources/photographs`;

const buildDetailEndpoint = (id: AggregateId) => `${indexEndpoint}/${id}`;

// We require an existing user for ACL tests
const dummyQueryUserId = buildDummyUuid(4);

const { user: users, userGroup: userGroups } = buildTestDataInFlatFormat();

const dummyUser = (users as CoscradUser[])[0].clone({
    authProviderUserId: `auth0|${dummyQueryUserId}`,
    id: dummyQueryUserId,
    roles: [CoscradUserRole.viewer],
});

const dummyGroup = (userGroups as CoscradUserGroup[])[0].clone({ userIds: [dummyUser.id] });

const dummyUserWithGroups = new CoscradUserWithGroups(dummyUser, [dummyGroup]);

// Set up test data (use event sourcing to set up state)
const photographTitle = `Photograph Title`;

const languageCodeForTitle = LanguageCode.Haida;

const photographId = buildDummyUuid(1);

const photographCompositeId = {
    type: AggregateType.photograph,
    id: photographId,
};

const dummyContributorFirstName = 'Dumb';

const dummyContributorLastName = 'McContributor';

const dummyContributor = getValidAggregateInstanceForTest(AggregateType.contributor).clone({
    fullName: new FullName({
        firstName: dummyContributorFirstName,
        lastName: dummyContributorLastName,
    }),
});

const photographCreated = new TestEventStream().andThen<PhotographCreated>({
    type: 'PHOTOGRAPH_CREATED',
    payload: {
        title: photographTitle,
        languageCodeForTitle: languageCodeForTitle,
        mediaItemId: 
    },
    meta: {
        contributorIds: [dummyContributor.id],
    },
});

const dummyTerm = TermViewModel.fromTermCreated(photographCreated.as(photographCompositeId)[0] as TermCreated);

const targetTermView = clonePlainObjectWithOverrides(dummyTerm, {
    isPublished: true,
    contributions: [
        {
            id: dummyContributor.id,
            fullName: dummyContributor.fullName.toString(),
        },
    ],
});

const privateTermThatUserCanAccess = clonePlainObjectWithOverrides(dummyTerm, {
    accessControlList: new AccessControlList({
        allowedUserIds: [dummyQueryUserId],
        allowedGroupIds: [],
    }),
    isPublished: false,
});

// TODO Add happy path cases for a prompt photograph
// const promptTermId = buildDummyUuid(2)

const assertResourceHasContributionFor = (
    { id: contributorId }: CoscradContributor,
    resource: BaseResourceViewModel
) => {
    const hasContribution = resource.contributions.some(
        ({ id }) => id === contributorId
        // TODO support joining in contributors
        // && fullName === `${firstName} ${lastName}`
    );

    expect(hasContribution).toBe(true);
};
