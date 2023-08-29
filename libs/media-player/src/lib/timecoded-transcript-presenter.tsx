import { ITranscript, LanguageCode } from '@coscrad/api-interfaces';
import { isNullOrUndefined } from '@coscrad/validation-constraints';
import { TranscriptLinePresenter } from './transcript-line-presenter';

interface TimecodedTranscriptPresenterProps {
    transcript: ITranscript;
    mediaCurrentTime: number;
    selectedTranscriptLanguageCode: LanguageCode;
}

export const TimecodedTranscriptPresenter = ({
    transcript,
    mediaCurrentTime,
    selectedTranscriptLanguageCode,
}: TimecodedTranscriptPresenterProps): JSX.Element => {
    const { items: transcriptItems } = transcript;

    /**
     * Not sure about this approach and performance here, but it's a start.
     * Problem areas: zero'th element of filtered array and conditional return
     * with empty fragment
     */
    const transcriptItemByCurrentTime = transcriptItems.filter(
        ({ inPointMilliseconds, outPointMilliseconds }) => {
            const inPointSeconds = inPointMilliseconds / 1000;

            const outPointSeconds = outPointMilliseconds / 1000;

            return mediaCurrentTime >= inPointSeconds && mediaCurrentTime <= outPointSeconds;
        }
    )[0];

    if (!isNullOrUndefined(transcriptItemByCurrentTime)) {
        const { text, speakerInitials } = transcriptItemByCurrentTime;

        const textInLanguage = text.items.filter(({ languageCode }) => {
            return languageCode === selectedTranscriptLanguageCode;
        })[0];

        return (
            // <FadeInOutContent>
            <TranscriptLinePresenter speakerInitials={speakerInitials} text={textInLanguage.text} />
            // </FadeInOutContent>
        );
    } else {
        return <></>;
    }
};
