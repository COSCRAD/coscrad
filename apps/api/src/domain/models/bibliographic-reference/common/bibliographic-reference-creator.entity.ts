import {
    BibliographicSubjectCreatorType,
    CoscradEnum,
    Enum,
    NonEmptyString,
} from '@coscrad/data-types';
import { DTO } from '../../../../types/DTO';
import { isNullOrUndefined } from '../../../utilities/validation/is-null-or-undefined';
import BaseDomainModel from '../../BaseDomainModel';

export default class BibliographicReferenceCreator extends BaseDomainModel {
    @NonEmptyString()
    readonly name: string;

    @Enum(CoscradEnum.BibliographicSubjectCreatorType)
    readonly type: BibliographicSubjectCreatorType;

    constructor(dto: DTO<BibliographicReferenceCreator>) {
        super();

        if (isNullOrUndefined(dto)) return;

        this.name = dto.name;

        this.type = dto.type;
    }
}
