import {
    IMultiLingualText,
    IMultlingualTextItem,
    LanguageCode,
    MultiLingualTextItemRole,
} from '@coscrad/api-interfaces';
import { ExternalEnum, NestedDataType, NonEmptyString } from '@coscrad/data-types';
import { DTO } from '../../../types/DTO';
import BaseDomainModel from '../../models/BaseDomainModel';

export { MultiLingualTextItemRole };

export class MultilingualTextItem extends BaseDomainModel implements IMultlingualTextItem {
    @ExternalEnum(
        {
            labelsAndValues: Object.entries(LanguageCode).map(([label, value]) => ({
                label,
                value,
            })),
            enumLabel: 'Language_Code',
            enumName: 'LangaugeCode',
        },
        {
            label: 'language code',
            description: 'an official identifier of the language',
        }
    )
    readonly languageId: LanguageCode;

    @NonEmptyString({
        label: 'text',
        description: 'plain text in the given language',
    })
    readonly text: string;

    @ExternalEnum(
        {
            labelsAndValues: Object.values(MultiLingualTextItemRole).map((label) => ({
                value: label,
                label,
            })),
            enumLabel: 'text item role',
            enumName: 'Multilingual Text Item Role',
        },
        {
            description: 'role of this text in the translation process',
            label: 'text item role',
        }
    )
    readonly role: MultiLingualTextItemRole;

    // TODO Support (user defined) dialects of the same language - would tags be the better way to do this?
    // @NonEmptyString({
    //     label: 'dialect',
    //     description: 'an informal identifier of the dialect of the given language',
    //     isOptional: true,
    // })
    // readonly dialect?: string;

    constructor(dto: DTO<MultilingualTextItem>) {
        super();

        if (!dto) return;

        const { languageId, role, text } = dto;

        this.languageId = languageId;

        this.role = role;

        this.text = text;
    }
}

export class MultiLingualText extends BaseDomainModel implements IMultiLingualText {
    @NestedDataType(MultilingualTextItem, {
        label: 'items',
        description: 'one item for each provided language',
        isArray: true,
    })
    readonly items: MultilingualTextItem[];

    constructor(dto: DTO<MultiLingualText>) {
        super();

        if (!dto) return;

        const { items } = dto;

        this.items = Array.isArray(items)
            ? items.map((item) => new MultilingualTextItem(item))
            : null;
    }

    toString(): string {
        return this.items.map(({ text, languageId }) => `{${languageId}}: ${text}`).join('\n');
    }
}
