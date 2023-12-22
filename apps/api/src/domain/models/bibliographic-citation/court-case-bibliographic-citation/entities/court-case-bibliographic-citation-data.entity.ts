import { ICourtCaseBibliographicCitationData } from '@coscrad/api-interfaces';
import { NonEmptyString, URL } from '@coscrad/data-types';
import { DTO } from '../../../../../types/DTO';
import { isNullOrUndefined } from '../../../../utilities/validation/is-null-or-undefined';
import BaseDomainModel from '../../../BaseDomainModel';
import { BibliographicCitationDataUnionMember } from '../../shared/bibliographic-citation-union-data-member.decorator';
import { BibliographicCitationType } from '../../types/bibliogrpahic-citation-type';

@BibliographicCitationDataUnionMember(BibliographicCitationType.courtCase)
export class CourtCaseBibliographicCitationData
    extends BaseDomainModel
    implements ICourtCaseBibliographicCitationData
{
    readonly type = BibliographicCitationType.courtCase;

    @NonEmptyString({
        label: 'case name',
        description: 'the official name of the court case',
    })
    readonly caseName: string;

    // We may want this in the future, but not existing data uses this prop
    // @NestedDataType(BibliographicCitationCreator, { isArray: true })
    // readonly creators: BibliographicCitationCreator[];

    @NonEmptyString({
        isOptional: true,
        label: 'abstract',
        description: 'a brief summary of the court case',
    })
    readonly abstract?: string;

    @NonEmptyString({
        isOptional: true,
        label: 'date decided',
        description: 'the date on which the court case was decided',
    })
    readonly dateDecided?: string;

    @NonEmptyString({
        isOptional: true,
        label: 'court',
        description: 'the name of the court in which the case was decided',
    })
    readonly court?: string;

    @URL({
        isOptional: true,
        label: 'external link',
        description: 'external link to digital materials regarding this court case',
    })
    readonly url?: string;

    /**
     * TODO [https://www.pivotaltracker.com/story/show/183122635]
     * Clarify the domain significance of this property and give it a more
     * transparent name.
     */
    @NonEmptyString({
        isOptional: true,
        label: 'pages',
        description: 'summary information about the pages relevant to this court case',
    })
    readonly pages?: string;

    constructor(dto: DTO<CourtCaseBibliographicCitationData>) {
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
