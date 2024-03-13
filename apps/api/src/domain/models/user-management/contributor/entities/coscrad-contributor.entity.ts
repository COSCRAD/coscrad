import { AggregateType } from '@coscrad/api-interfaces';
import { NestedDataType } from '@coscrad/data-types';
import { MultilingualText } from '../../../../../domain/common/entities/multilingual-text';
import { AggregateCompositeIdentifier } from '../../../../../domain/types/AggregateCompositeIdentifier';
import { InternalError } from '../../../../../lib/errors/InternalError';
import { Aggregate } from '../../../aggregate.entity';
import { FullName } from '../../user/entities/user/full-name.entity';
import { CoscradDate } from '../../utilities/coscrad-date.entity';

export class CoscradContributor extends Aggregate {
    readonly type = AggregateType.contributor;

    @NestedDataType(FullName, {
        label: 'full name',
        description: "The Contributor's Full Name",
    })
    readonly fullName: FullName;

    @NestedDataType(CoscradDate, {
        label: 'date of birth',
        description: "Contributor's Date of Birth",
    })
    readonly dateOfBirth?: CoscradDate;

    readonly shortBio?: string;

    protected validateComplexInvariants(): InternalError[] {
        throw new Error('Method not implemented.');
    }
    getAvailableCommands(): string[] {
        throw new Error('Method not implemented.');
    }
    getName(): MultilingualText {
        throw new Error('Method not implemented.');
    }
    protected getExternalReferences(): AggregateCompositeIdentifier[] {
        throw new Error('Method not implemented.');
    }
}
