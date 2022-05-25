import { DTO } from '../../../../types/DTO';
import { isNullOrUndefined } from '../../../utilities/validation/is-null-or-undefined';
import BaseDomainModel from '../../BaseDomainModel';
import { CreatorType } from '../types/CreatorType';

export default class BibliographicReferenceCreator extends BaseDomainModel {
    readonly name: string;

    readonly type: CreatorType;

    constructor(dto: DTO<BibliographicReferenceCreator>) {
        super();

        if (isNullOrUndefined(dto)) return;

        this.name = dto.name;

        this.type = dto.type;
    }
}
