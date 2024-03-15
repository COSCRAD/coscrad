import { AggregateType, LanguageCode } from '@coscrad/api-interfaces';
import { NestedDataType, NonEmptyString } from '@coscrad/data-types';
import { RegisterIndexScopedCommands } from '../../../../../app/controllers/command/command-info/decorators/register-index-scoped-commands.decorator';
import { buildMultilingualTextWithSingleItem } from '../../../../../domain/common/build-multilingual-text-with-single-item';
import { MultilingualText } from '../../../../../domain/common/entities/multilingual-text';
import { AggregateRoot } from '../../../../../domain/decorators';
import { AggregateCompositeIdentifier } from '../../../../../domain/types/AggregateCompositeIdentifier';
import { InternalError } from '../../../../../lib/errors/InternalError';
import { Aggregate } from '../../../aggregate.entity';
import { FullName } from '../../user/entities/user/full-name.entity';
import { CoscradDate } from '../../utilities/coscrad-date.entity';

@AggregateRoot(AggregateType.contributor)
@RegisterIndexScopedCommands([])
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

    @NonEmptyString({
        label: 'biography',
        description: 'A Short Biography',
    })
    readonly shortBio?: string;

    protected validateComplexInvariants(): InternalError[] {
        throw new Error('Method not implemented.');
    }

    getAvailableCommands(): string[] {
        return [];
    }

    getName(): MultilingualText {
        return buildMultilingualTextWithSingleItem(this.fullName.toString(), LanguageCode.English);
    }

    protected getExternalReferences(): AggregateCompositeIdentifier[] {
        return [];
    }
}
