import { DTO } from '../../../../types/DTO';
import { isNullOrUndefined } from '../../../utilities/validation/is-null-or-undefined';
import BaseDomainModel from '../../BaseDomainModel';
import { CreatorType } from './CreatorType';

interface IBibliographicReferenceDataCreator {
    name: string;
    type: CreatorType;
}

export default class Creator extends BaseDomainModel implements IBibliographicReferenceDataCreator {
    readonly name: string;

    readonly type: CreatorType;

    constructor(dto: DTO<Creator>) {
        super();

        if (isNullOrUndefined(dto)) return;

        this.name = dto.name;

        this.type = dto.type;
    }
}
