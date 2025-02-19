import {
    AggregateType,
    CoscradUserRole,
    LanguageCode,
    MultilingualTextItemRole,
} from '@coscrad/api-interfaces';
import getValidAggregateInstanceForTest from '../../domain/__tests__/utilities/getValidAggregateInstanceForTest';
import { MultilingualText } from '../../domain/common/entities/multilingual-text';
import buildDummyUuid from '../../domain/models/__tests__/utilities/buildDummyUuid';
import { PhotographCreated } from '../../domain/models/photograph';
import { AccessControlList } from '../../domain/models/shared/access-control/access-control-list.entity';
import { CoscradUserGroup } from '../../domain/models/user-management/group/entities/coscrad-user-group.entity';
import { CoscradUserWithGroups } from '../../domain/models/user-management/user/entities/user/coscrad-user-with-groups';
import { CoscradUser } from '../../domain/models/user-management/user/entities/user/coscrad-user.entity';
import { FullName } from '../../domain/models/user-management/user/entities/user/full-name.entity';
import { clonePlainObjectWithOverrides } from '../../lib/utilities/clonePlainObjectWithOverrides';
import buildTestDataInFlatFormat from '../../test-data/buildTestDataInFlatFormat';
import { TestEventStream } from '../../test-data/events';
import { PhotographViewModel } from '../buildViewModelForResource/viewModels/photograph.view-model';

const indexEndpoint = `/resources/terms`;

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
const photographTitle = `Photograph Name (in the language)`;

const originalLanguage = LanguageCode.Haida;

const photographTitleTranslation = `Photograph Name (in English)`;

const translationLanguage = LanguageCode.English;

const photographId = buildDummyUuid(101);

const photographCompositeIdentifier = {
    type: AggregateType.photograph,
    id: photographId,
};

const photographIdUnpublishedNoUserAccessId = buildDummyUuid(102);

const photographIdUnpublishedWithUserAccessId = buildDummyUuid(103);

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
        languageCodeForTitle: originalLanguage,
    },
    meta: {
        // we also want to check that the contributions come through
        contributorIds: [dummyContributor.id],
    },
});

const dummyPhotographView = clonePlainObjectWithOverrides(
    PhotographViewModel.fromPhotographCreated(
        photographCreated.as(photographCompositeIdentifier)[0] as PhotographCreated
    ),
    {
        contributions: [
            {
                id: dummyContributor.id,
                fullName: dummyContributor.fullName.toString(),
            },
        ],
    }
);

const publicPhotographView = clonePlainObjectWithOverrides(dummyPhotographView, {
    isPublished: true,
    name: new MultilingualText(dummyPhotographView.name).translate({
        text: photographTitleTranslation,
        languageCode: translationLanguage,
        role: MultilingualTextItemRole.freeTranslation,
        // we are insisting by casting that the call to `translate` won't fail above
    }) as MultilingualText,
});

const privatePhotographThatUserCanAccess = clonePlainObjectWithOverrides(publicPhotographView, {
    id: photographIdUnpublishedWithUserAccessId,
    isPublished: false,
    accessControlList: new AccessControlList().allowUser(dummyQueryUserId),
});

const privatePhotographUserCannotAccess = clonePlainObjectWithOverrides(publicPhotographView, {
    id: photographIdUnpublishedNoUserAccessId,
    isPublished: false,
    // no special access
    accessControlList: new AccessControlList(),
});
