import { NonEmptyString, URL } from '@coscrad/data-types';
import { DTO } from '../../../../../types/DTO';
import { isNullOrUndefined } from '../../../../utilities/validation/is-null-or-undefined';
import BaseDomainModel from '../../../BaseDomainModel';
import { IBibliographicReferenceData } from '../../interfaces/bibliographic-reference-data.interface';
import { BibliographicReferenceType } from '../../types/BibliographicReferenceType';

export class CourtCaseBibliographicReferenceData
    extends BaseDomainModel
    implements IBibliographicReferenceData
{
    readonly type = BibliographicReferenceType.courtCase;

    @NonEmptyString()
    readonly caseName: string;

    // We may want this in the future, but not existing data uses this prop
    // @NestedDataType(BibliographicReferenceCreator, { isArray: true })
    // readonly creators: BibliographicReferenceCreator[];

    @NonEmptyString({ isOptional: true })
    readonly abstract?: string;

    @NonEmptyString({ isOptional: true })
    readonly dateDecided?: string;

    @NonEmptyString({ isOptional: true })
    readonly court?: string;

    @URL({ isOptional: true })
    readonly url?: string;

    /**
     * TODO [https://www.pivotaltracker.com/story/show/183122635]
     * Clarify the domain significance of this property and give it a more
     * transparent name.
     */
    @NonEmptyString({ isOptional: true })
    readonly pages?: string;

    constructor(dto: DTO<CourtCaseBibliographicReferenceData>) {
        super();

        if (isNullOrUndefined(dto)) return;

        const { caseName, abstract, dateDecided, court, url, pages } = dto;

        this.caseName = caseName;

        this.abstract = abstract;

        this.dateDecided = dateDecided;

        this.court = court;

        this.url = url;

        this.pages = pages;
    }
}
