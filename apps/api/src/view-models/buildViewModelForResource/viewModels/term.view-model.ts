import { ITermViewModel } from '@coscrad/api-interfaces';
import { FromDomainModel, NonEmptyString, URL } from '@coscrad/data-types';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Term } from '../../../domain/models/term/entities/term.entity';
import { BaseViewModel } from './base.view-model';

// TODO Add proper contributors repository \ collection
const contributors = {
    1: 'Bella Alphonse',
    2: 'William Myers',
};

const getContributorNameFromId = (id: string): string => contributors[id] || '';

const FromTerm = FromDomainModel(Term);

export class TermViewModel extends BaseViewModel implements ITermViewModel {
    @ApiProperty({
        example: 'Jane Doe',
        description: 'The language speaker who contributed the term',
    })

    // TODO Use edge-connections with a `Contributor` resource for this instead
    @NonEmptyString({
        label: 'contributor',
        description: 'name of the person who contributed this term',
    })
    readonly contributor: string;

    // We should wrap the API Property using the View Model Schemas!
    @ApiProperty({
        example: 'word, phrase, or sentence in the language',
        description: '',
    })
    @FromTerm
    readonly term: string;

    @ApiPropertyOptional({
        example: 'He usually tells stories.',
        description: 'translation into colonial language \\ gloss of the term',
    })
    @FromTerm
    readonly termEnglish?: string;

    @ApiPropertyOptional({
        example: 'https://www.mysound.org/audio/hetellsstories.mp3',
        description: 'a url for an audio recording of the given term in the language',
    })
    @URL({
        label: 'audio link',
        description: "a web link to a digital audio recording of this term's pronunciation",
    })
    readonly audioURL?: string;

    @ApiPropertyOptional({
        example: 'Digital Verb Book v 1.0',
        description:
            'the name of the project through which this term was documented (if applicable)',
    })
    @FromTerm
    readonly sourceProject?: string;

    constructor(term: Term) {
        super(term);

        const { contributorId, audioFilename, sourceProject } = term;

        this.contributor = getContributorNameFromId(contributorId);

        if (audioFilename) this.audioURL = audioFilename;

        if (sourceProject) this.sourceProject = sourceProject;
    }
}
