import { Ctor } from '../../../../../lib/types/Ctor';
import { Maybe } from '../../../../../lib/types/maybe';
import { NotFound } from '../../../../../lib/types/not-found';
import { IBibliographicCitation } from '../../interfaces/bibliographic-citation.interface';

const BIBLIOGRAPHIC_CITATION_METADATA_KEY = 'BIBLIOGRAPHIC_CITATION_METADATA_KEY';

type BibliographicCitationMetadata = {
    type: string;
    Ctor: Ctor<IBibliographicCitation>;
};

export const getBibliographicCitationMetadata = (
    target: unknown
): Maybe<BibliographicCitationMetadata> => {
    const searchResult = Reflect.getMetadata(BIBLIOGRAPHIC_CITATION_METADATA_KEY, target);

    return (searchResult as BibliographicCitationMetadata) || NotFound;
};

export const BibliographicCitation = (bibliographicCitationType: string): ClassDecorator => {
    return function (target: unknown) {
        Reflect.defineMetadata(
            BIBLIOGRAPHIC_CITATION_METADATA_KEY,
            { type: bibliographicCitationType },
            target
        );
    };
};
