import { AggregateType, LanguageCode, ResourceType } from '@coscrad/api-interfaces';
import { CommandFSA } from '../../app/controllers/command/command-fsa/command-fsa.entity';
import buildDummyUuid from '../../domain/models/__tests__/utilities/buildDummyUuid';
import {
    AddPageToDigitalText,
    CreateDigitalText,
    DigitalTextCreated,
    PageAddedToDigitalText,
} from '../../domain/models/digital-text/commands';
import { ADD_PAGE_TO_DIGITAL_TEXT } from '../../domain/models/digital-text/constants';
import {
    GrantResourceReadAccessToUser,
    ResourceReadAccessGrantedToUser,
} from '../../domain/models/shared/common-commands';
import { ResourcePublished } from '../../domain/models/shared/common-commands/publish-resource/resource-published.event';
import { clonePlainObjectWithOverrides } from '../../lib/utilities/clonePlainObjectWithOverrides';
import { buildTestCommandFsaMap } from '../commands';

const id = buildDummyUuid(153);

const testFsaMap = buildTestCommandFsaMap();

const digitalTextTitle = `Foo Bar Baz Text`;

const languageCodeForTitle = LanguageCode.Haida;

const createDigitalText = clonePlainObjectWithOverrides(
    testFsaMap.get(`CREATE_DIGITAL_TEXT`) as CommandFSA<CreateDigitalText>,
    {
        payload: {
            aggregateCompositeIdentifier: { id },
            title: digitalTextTitle,
            languageCodeForTitle,
        },
    }
);

const dummySystemUserId = buildDummyUuid(999);

const digitalTextCreated = new DigitalTextCreated(
    createDigitalText.payload,
    buildDummyUuid(154),
    dummySystemUserId
);

const dummyPageIdentifier = '21';

const addPageToDigitalText = clonePlainObjectWithOverrides(
    testFsaMap.get(ADD_PAGE_TO_DIGITAL_TEXT) as CommandFSA<AddPageToDigitalText>,
    {
        payload: {
            aggregateCompositeIdentifier: { id },
            identifier: dummyPageIdentifier,
        },
    }
);

const pageAddedForDigitalText = new PageAddedToDigitalText(
    addPageToDigitalText.payload,
    buildDummyUuid(155),
    dummySystemUserId
);

const idForUserWithAccessToDigitalText = buildDummyUuid(45);

const grantReadAccessToUserForDigitalText = clonePlainObjectWithOverrides(
    testFsaMap.get(
        'GRANT_RESOURCE_READ_ACCESS_TO_USER'
    ) as CommandFSA<GrantResourceReadAccessToUser>,
    {
        payload: {
            aggregateCompositeIdentifier: { type: ResourceType.digitalText, id },
            userId: idForUserWithAccessToDigitalText,
        },
    }
);

const digitalTextReadAccessGrantedToUser = new ResourceReadAccessGrantedToUser(
    grantReadAccessToUserForDigitalText.payload,
    buildDummyUuid(579),
    dummySystemUserId
);

const resourcePublished = new ResourcePublished(
    {
        aggregateCompositeIdentifier: {
            id,
            type: AggregateType.digitalText,
        },
    },
    buildDummyUuid(580),
    dummySystemUserId
);

export const buildComprehensiveEventStreamForDigitalText = () => [
    digitalTextCreated,
    pageAddedForDigitalText,
    digitalTextReadAccessGrantedToUser,
    resourcePublished,
];
