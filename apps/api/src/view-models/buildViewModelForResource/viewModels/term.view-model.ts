import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Term } from 'apps/api/src/domain/models/term/entities/term.entity';
import { BaseViewModel } from './base.view-model';
import buildFullDigitalAssetURL from './utilities/buildFullDigitalAssetURL';

// TODO Add proper contributors repository \ collection
const contributors = {
    1: 'Bella Alphonse',
    2: 'William Myers',
};

const getContributorNameFromId = (id: string): string => contributors[id] || '';

export class TermViewModel extends BaseViewModel {
    @ApiProperty({
        example: 'Jane Doe',
        description: 'The language speaker who contributed the term',
    })
    readonly contributor: string;

    @ApiProperty({
        example: 'word, phrase, or sentence in the language',
        description: '',
    })
    readonly term: string;

    @ApiPropertyOptional({
        example: 'He usually tells stories.',
        description: 'translation into colonial language \\ gloss of the term',
    })
    readonly termEnglish?: string;

    @ApiPropertyOptional({
        example: 'https://www.mysound.org/audio/hetellsstories.mp3',
        description: 'a url for an audio recording of the given term in the language',
    })
    readonly audioURL?: string;

    @ApiPropertyOptional({
        example: 'Digital Verb Book v 1.0',
        description:
            'the name of the project through which this term was documented (if applicable)',
    })
    readonly sourceProject?: string;

    readonly #baseAudioURL: string;

    constructor(
        {
            id,
            contributorId,
            term: text,
            termEnglish: textEnglish,
            audioFilename,
            sourceProject,
        }: Term,
        baseAudioURL: string
    ) {
        super({ id });

        this.#baseAudioURL = baseAudioURL;

        this.contributor = getContributorNameFromId(contributorId);

        this.term = text;

        this.termEnglish = textEnglish;

        if (audioFilename) this.audioURL = this.#buildAudioURL(audioFilename);

        if (sourceProject) this.sourceProject = sourceProject;
    }

    #buildAudioURL(filename: string, extension = 'mp3'): string {
        return buildFullDigitalAssetURL(this.#baseAudioURL, filename, extension);
    }
}
