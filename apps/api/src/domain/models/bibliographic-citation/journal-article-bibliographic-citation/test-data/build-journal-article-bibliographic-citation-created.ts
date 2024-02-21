import { AggregateType } from '@coscrad/api-interfaces';
import { BibliographicSubjectCreatorType } from '@coscrad/data-types';
import { clonePlainObjectWithOverrides } from '../../../../../lib/utilities/clonePlainObjectWithOverrides';
import { EventMetadataBuilder } from '../../../../../test-data/events';
import { DeepPartial } from '../../../../../types/DeepPartial';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import BibliographicCitationCreator from '../../common/bibliographic-citation-creator.entity';
import {
    JournalArticleBibliographicCitationCreated,
    JournalArticleBibliographicCitationCreatedPayload,
} from '../commands/journal-article-bibliographic-citation-created.event';

export const buildJournalArticleBibliographicCitationCreated = (
    payloadOverrides: DeepPartial<JournalArticleBibliographicCitationCreatedPayload>,
    buildMetadata: EventMetadataBuilder
) => {
    const defaultPayload: JournalArticleBibliographicCitationCreatedPayload = {
        aggregateCompositeIdentifier: {
            type: AggregateType.bibliographicCitation,
            id: buildDummyUuid(1),
        },
        title: 'On the Origin of the Universe',
        creators: [
            {
                name: 'Alberta Einstain',
                type: BibliographicSubjectCreatorType.author,
            },
        ].map((dto) => new BibliographicCitationCreator(dto)),
        issueDate: '08-08-1908',
        // we omit optional properties so that one doesn't need to remove properties in overrides
    };

    return new JournalArticleBibliographicCitationCreated(
        clonePlainObjectWithOverrides(defaultPayload, payloadOverrides),
        buildMetadata()
    );
};
