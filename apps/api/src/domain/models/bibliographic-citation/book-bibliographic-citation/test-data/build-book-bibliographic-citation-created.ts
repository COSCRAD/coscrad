import { AggregateType } from '@coscrad/api-interfaces';
import { BibliographicSubjectCreatorType } from '@coscrad/data-types';
import { clonePlainObjectWithOverrides } from '../../../../../lib/utilities/clonePlainObjectWithOverrides';
import { EventMetadataBuilder } from '../../../../../test-data/events';
import { DeepPartial } from '../../../../../types/DeepPartial';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import BibliographicCitationCreator from '../../common/bibliographic-citation-creator.entity';
import {
    BookBibliographicCitationCreated,
    BookBibliographicCitationCreatedPayload,
} from '../commands/create-book-bibliographic-citation/book-bibliographic-citation-created.event';

export const buildBookCreated = (
    payloadOverrides: DeepPartial<BookBibliographicCitationCreatedPayload>,
    buildMetadata: EventMetadataBuilder
) => {
    const defaultPayload: BookBibliographicCitationCreatedPayload = {
        aggregateCompositeIdentifier: {
            type: AggregateType.bibliographicCitation,
            id: buildDummyUuid(5),
        },
        title: 'A History of the Region',
        creators: [
            // TODO Should this really be the instance?
            new BibliographicCitationCreator({
                name: 'Professor Jane',
                type: BibliographicSubjectCreatorType.author,
            }),
        ],
    };

    return new BookBibliographicCitationCreated(
        clonePlainObjectWithOverrides(defaultPayload, payloadOverrides),
        buildMetadata()
    );
};
