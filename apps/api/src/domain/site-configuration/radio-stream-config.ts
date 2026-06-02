import { NonEmptyString, URL } from '@coscrad/data-types';

// Not sure which if any properties are optional

export class RadioStreamConfig {
    @NonEmptyString({
        label: 'title',
        description: 'radio stream title',
    })
    title: string;

    @NonEmptyString({
        label: 'route',
        description: 'route for the streaming service',
    })
    route: string;

    @NonEmptyString({
        label: 'label',
        description: 'radio stream label, e.g., 89.5',
    })
    label: string;

    @URL({
        label: 'logo url',
        description: 'logo for the radio stream logo',
    })
    logoUrl: string;

    @URL({
        label: 'ice cast link',
        description: 'Ice Cast link for the radio stream',
    })
    iceCastLink: string;

    @NonEmptyString({
        label: 'playing message',
        description: 'playing message used when the radio stream is actively playing',
    })
    playingMessage: string;

    @NonEmptyString({
        label: 'mission statement',
        description: 'mission statement for the radio stream',
    })
    missionStatement: string;
}
