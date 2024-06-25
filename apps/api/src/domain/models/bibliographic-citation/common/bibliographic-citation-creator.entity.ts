import { IBibliographicCitationCreator } from '@coscrad/api-interfaces';
import {
    BibliographicSubjectCreatorType,
    CoscradEnum,
    Enum,
    NonEmptyString,
} from '@coscrad/data-types';
import { DTO } from '../../../../types/DTO';
import { isNullOrUndefined } from '../../../utilities/validation/is-null-or-undefined';
import BaseDomainModel from '../../base-domain-model.entity';

export default class BibliographicCitationCreator
    extends BaseDomainModel
    implements IBibliographicCitationCreator
{
    @NonEmptyString({
        label: 'name',
        description: "full name of work's creator (free-form text)",
    })
    readonly name: string;

    @Enum(CoscradEnum.BibliographicSubjectCreatorType, {
        label: 'creator type',
        description: "the person's role in creating the given work",
    })
    readonly type: BibliographicSubjectCreatorType;

    constructor(dto: DTO<BibliographicCitationCreator>) {
        super();

        if (isNullOrUndefined(dto)) return;

        this.name = dto.name;

        this.type = dto.type;
    }
}
