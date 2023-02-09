import { AggregateType, FluxStandardAction } from '@coscrad/api-interfaces';
import { IIdGenerator } from '../../../domain/interfaces/id-generator.interface';
import { CreateMediaItem } from '../../../domain/models/media-item/commands/create-media-item.command';
import { TagResourceOrNote } from '../../../domain/models/tag/commands';
import { AggregateId } from '../../../domain/types/AggregateId';
import { IAudioParsingStrategy } from '../audio-parsing-strategy.interface';
import { PrefixExtensionAndMimeType } from '../bulk-audio-filename-parser';

// the aggregateCompositeIdentifier must be generated for a create command
// type CreateDto<T extends ICommandBase> = DTO<Omit<T, 'aggregateCompositeIdentifier'>>;

// TODO We should probably use RegExp instead if we do more of this.
const calculateRawData = (prefix: string): Record<string, string> => {
    const suffixIncludesUsitativeIndicator = (suffix: string) => suffix.length === 5;

    const splitOnUnderscore = prefix.split('_');

    // there is no suffix or there is an invalid format- do not store any raw data
    if (splitOnUnderscore.length !== 2) return {};

    const suffix = splitOnUnderscore[1];

    // the suffix has the wrong length- do not store any raw daata
    if (suffix.length < 4 || prefix.length > 5) return {};

    const positive = suffix[0];

    const aspect = suffix[1];

    const usitative = suffixIncludesUsitativeIndicator(suffix) && suffix[2] === 'u' ? '1' : '0';

    const person = suffixIncludesUsitativeIndicator(suffix) ? suffix[3] : suffix[2];

    const number = suffixIncludesUsitativeIndicator(suffix) ? suffix[4] : suffix[3];

    return {
        positive,
        aspect,
        usitative,
        person,
        number,
    };
};

const decodeFilename = (encoded: string): string => {
    // ʔŝŵẑɨ’
    const replacements = [
        ['ss', 'ŝ'],
        ['ww', 'ŵ'],
        ['zz', 'ẑ'],
        ['7', 'ʔ'],
        ['ii', 'ɨ'],
        ['_', ' '],
        ['--', '$'],
        ['-', '’'],
        ['$', '-'],
        ['.', ''],
    ];

    return replacements.reduce((acc, [oldChar, newChar]) => acc.replace(oldChar, newChar), encoded);
};

const buildCreateMediaItemFsa = (
    { prefix, extension, mimeType }: PrefixExtensionAndMimeType,
    baseAudioUrl: string,
    aggregateCompositeIdentifier: { type: typeof AggregateType.mediaItem; id: AggregateId }
): FluxStandardAction<CreateMediaItem> => ({
    type: 'CREATE_MEDIA_ITEM',
    payload: {
        aggregateCompositeIdentifier,
        mimeType,
        title: decodeFilename(prefix),
        titleEnglish: `${prefix}.${extension}`,
        rawData: calculateRawData(prefix),
        url: `${baseAudioUrl}${prefix}.${extension}`,
    },
});

export class BAParadigmsAudioRegistrationStrategy implements IAudioParsingStrategy {
    private aggregateCompositeIdentifier: {
        type: typeof AggregateType.mediaItem;
        id: AggregateId;
    };

    constructor(
        private readonly baseAudioUrl: string,
        private readonly idGenerator: IIdGenerator,
        private readonly tagCompositeIdentifier: {
            type: typeof AggregateType.tag;
            id: AggregateId;
        }
    ) {}

    async createCommandStream(
        parsedAudioFilenameDetails: PrefixExtensionAndMimeType
    ): Promise<FluxStandardAction<CreateMediaItem | TagResourceOrNote>[]> {
        const newId = await this.idGenerator.generate();

        // This must be injected after generating the new ID!
        this.aggregateCompositeIdentifier = {
            type: AggregateType.mediaItem,
            id: newId,
        };

        return [
            this.buildCreateMediaItemFsa(parsedAudioFilenameDetails),
            this.buildTagResourceFsa(),
        ];
    }

    private buildCreateMediaItemFsa(
        parsedAudioFilenameDetails: PrefixExtensionAndMimeType
    ): FluxStandardAction<CreateMediaItem> {
        return buildCreateMediaItemFsa(
            parsedAudioFilenameDetails,
            this.baseAudioUrl,
            this.aggregateCompositeIdentifier
        );
    }

    private buildTagResourceFsa(): FluxStandardAction<TagResourceOrNote> {
        return {
            type: 'TAG_RESOURCE_OR_NOTE',
            payload: {
                aggregateCompositeIdentifier: this.tagCompositeIdentifier,
                taggedMemberCompositeIdentifier: this.aggregateCompositeIdentifier,
            },
        };
    }
}
