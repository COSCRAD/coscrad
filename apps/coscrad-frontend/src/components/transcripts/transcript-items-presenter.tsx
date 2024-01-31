import { ITranscriptItem, MultilingualTextItemRole } from '@coscrad/api-interfaces';
import { OriginalTranscriptTextPresenter } from './original-transcript-text-presenter';

interface TranscriptItemsPresenterProps {
    transcriptItems: ITranscriptItem[];
}

export const TranscriptItemsPresenter = ({
    transcriptItems,
}: TranscriptItemsPresenterProps): JSX.Element => {
    if (transcriptItems.length === 0) return null;

    return (
        <>
            {transcriptItems.map((transcriptItem) => {
                const originalItem = transcriptItem.text.items.find(
                    ({ role }) => role === MultilingualTextItemRole.original
                );

                const { inPointMilliseconds, outPointMilliseconds, speakerInitials } =
                    transcriptItem;

                const { text, languageCode: originalLanguageCode } = originalItem;

                return (
                    <>
                        <OriginalTranscriptTextPresenter
                            text={text}
                            languageCode={originalLanguageCode}
                            speakerInitials={speakerInitials}
                            inPointMilliseconds={inPointMilliseconds}
                            outPointMilliseconds={outPointMilliseconds}
                        />
                        {/* <TranslatedTranscriptTextItemPresenter /> */}
                    </>
                );
            })}
        </>
    );
};
