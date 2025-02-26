import { ResourceCompositeIdentifier } from '@coscrad/api-interfaces';
import { ResultOrError } from '../../../../types/ResultOrError';
import { ResourceType } from '../../../types/ResourceType';
import BaseDomainModel from '../../base-domain-model.entity';
import { Resource } from '../../resource.entity';
import { IBibliographicCitationData } from './bibliographic-citation-data.interface';

export interface IBibliographicCitation<
    T extends IBibliographicCitationData = IBibliographicCitationData
> extends Resource {
    type: typeof ResourceType.bibliographicCitation;

    data: T & BaseDomainModel;

    /**
     * A `BibliographicCitation` represents a (typically academic) external
     * resource. In order for such a resource to participate in the web of knowledge,
     * a user must link the citation to an internal resource. Currently, only
     * a `DigitalText` is supported as the digital representation of a `BibliographicCitation`,
     * but in the future other resource types may be allowed (e.g. for `VideoBibliographicCitations`).
     */
    digitalRepresentationResourceCompositeIdentifier?: ResourceCompositeIdentifier;

    registerDigitalRepresentation(
        compositeIdentifier: ResourceCompositeIdentifier
    ): ResultOrError<IBibliographicCitation<T>>;
}
