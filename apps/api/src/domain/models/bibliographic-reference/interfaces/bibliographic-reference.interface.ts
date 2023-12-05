import { ResourceCompositeIdentifier } from '@coscrad/api-interfaces';
import { ResourceType } from '../../../types/ResourceType';
import BaseDomainModel from '../../BaseDomainModel';
import { Resource } from '../../resource.entity';
import { IBibliographicReferenceData } from './bibliographic-reference-data.interface';

export interface IBibliographicReference<
    T extends IBibliographicReferenceData = IBibliographicReferenceData
> extends Resource {
    type: typeof ResourceType.bibliographicReference;

    data: T & BaseDomainModel;

    /**
     * A `BibliographicCitation` represents a (typically academic) external
     * resource. In order for such a resource to participate in the web of knowledge,
     * a user must link the citation to an internal resource. Currently, only
     * a `DigitalText` is supported as the digital representation of a `BibliographicCitation`,
     * but in the future other resource types may be allowed (e.g. for `VideoBibliographicCitations`).
     */
    digitalRepresentationResourceCompositeIdentifier?: ResourceCompositeIdentifier;
}
