import { AggregateType, LanguageCode } from '@coscrad/api-interfaces';
import { PublishResource } from '../../domain/models/shared/common-commands';
import { CreateTerm, TranslateTerm } from '../../domain/models/term/commands';
import { CommandFSA } from '../controllers/command/command-fsa/command-fsa.entity';

export type LegacyTerm = {
    _key: string;
    _id: string;
    _rev: string;
    published: boolean;
    term?: string;
    termEnglish?: string;
    contributorId: string;
    audioFilename: string;
    sourceId: string;
};

export const buildCommandStreamForLegacyTerm = (legacyTerm: LegacyTerm): CommandFSA[] => {
    const { term, termEnglish, contributorId, _key } = legacyTerm;

    const aggregateCompositeIdentifier = {
        type: AggregateType.term,
        // Note we are starting with Arango documents
        id: _key,
    };

    const createTermFsa: CommandFSA<CreateTerm> = {
        type: 'CREATE_TERM',
        payload: {
            aggregateCompositeIdentifier: aggregateCompositeIdentifier,
            text: term,
            languageCode: LanguageCode.Chilcotin,
            contributorId,
            rawData: legacyTerm,
        },
    };

    const translateTermFsa: CommandFSA<TranslateTerm> = {
        type: 'TRANSLATE_TERM',
        payload: {
            aggregateCompositeIdentifier,
            translation: termEnglish,
            languageCode: LanguageCode.English,
        },
    };

    const publishResourceFsa: CommandFSA<PublishResource> = {
        type: `PUBLISH_RESOURCE`,
        payload: { aggregateCompositeIdentifier },
    };

    return [createTermFsa, translateTermFsa, publishResourceFsa];
};
