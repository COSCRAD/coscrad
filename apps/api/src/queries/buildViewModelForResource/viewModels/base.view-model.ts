import { IBaseViewModel, IMultilingualText, LanguageCode } from '@coscrad/api-interfaces';
import { FromDomainModel, NestedDataType } from '@coscrad/data-types';
import { isNonEmptyObject } from '@coscrad/validation-constraints';
import { ApiProperty } from '@nestjs/swagger';
import { MultilingualText } from '../../../domain/common/entities/multilingual-text';
import { Aggregate } from '../../../domain/models/aggregate.entity';
import { Ctor } from '../../../lib/types/Ctor';
import { HasViewModelId, ViewModelId } from './types/ViewModelId';

export interface Nameable {
    getName(): MultilingualText;
}
// TODO Remove this
export class BaseViewModel implements IBaseViewModel {
    @ApiProperty({
        example: '12',
        description: 'uniquely identifies an entity from other entities of the same type',
    })
    @FromDomainModel(Aggregate as unknown as Ctor<unknown>)
    readonly id: ViewModelId;

    @NestedDataType(MultilingualText, {
        description: `multilingual text name of the entity`,
        label: `name`,
    })
    readonly name: IMultilingualText;

    constructor(domainModel: HasViewModelId & Nameable) {
        this.id = domainModel.id;

        const name = domainModel.getName();

        if (isNonEmptyObject(name)) {
            this.name = new MultilingualText({
                ...name,
                items: name.items.map((item) => {
                    if (item.languageCode !== LanguageCode.Chilcotin) {
                        return item;
                    }

                    /**
                     * TODO In the long run, I think we want to do this in the
                     * event consumers.
                     */
                    const defaultCharacterReplacements = {
                        // (U+0073) - ◌̂ (U+0302)[
                        // ŝ
                        [`s${`\u0302`}`]: '\u015d',
                        // Ŝ
                        [`S${`\u0302`}`]: '\u015c',
                        // ŵ
                        [`w${`\u0302`}`]: '\u0175',
                        // Ŵ
                        [`W${`\u0302`}`]: '\u0174',
                        // ẑ:
                        [`z${`\u0302`}`]: '\u1e91',
                        // Ẑ
                        [`Z${`\u0302`}`]: '\u1e91',
                    };

                    const updatedText = Object.entries(defaultCharacterReplacements).reduce(
                        (updatedText, [twoCharSequenceWithLoneSurrogate, singleUnicodeChar]) =>
                            updatedText.replace(
                                twoCharSequenceWithLoneSurrogate,
                                singleUnicodeChar
                            ),
                        item.text
                    );

                    // @ts-expect-error skip immutability
                    item.text = updatedText;

                    return item;
                }),
            });
        }
    }
}
