import { ITranscript } from '@coscrad/api-interfaces';

export const formatTranscriptAsSubtitles = (transcript: ITranscript) => {
    const { items } = transcript;
    const subtitleContent = items.map(
        ({ inPointMilliseconds, outPointMilliseconds, text, speakerInitials }) => {
            return {
                inPointMilliseconds: inPointMilliseconds,
                outPointMilliseconds: outPointMilliseconds,
                text: `${speakerInitials}: ${text}`,
            };
        }
    );
};
