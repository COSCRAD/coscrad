import { isNullOrUndefined } from '@coscrad/validation-constraints';
import { styled } from '@mui/material';
import { LanguageCode } from './language-code.enum';
import { Subtitle } from './video-prototype-player';

const StyledSubtitle = styled('span')({
    color: 'yellow',
    fontSize: '1.6em',
});

interface SubtitlesByTimeProps {
    subtitles: Subtitle[];
    currentTime: number;
    selectedLanguageCodeForSubtitles: LanguageCode;
}

export const SubtitlesByTime = ({
    subtitles,
    currentTime,
    selectedLanguageCodeForSubtitles,
}: SubtitlesByTimeProps): JSX.Element => {
    /**
     * Not sure about this approach and performance here, but it's a start.
     * Problem areas: zero'th element of filtered array and conditional return
     * with empty fragment
     */
    const subtitleByCurrentTime = subtitles.filter(
        ({ inPointMilliseconds, outPointMilliseconds }) => {
            const inPointSeconds = inPointMilliseconds / 1000;

            const outPointSeconds = outPointMilliseconds / 1000;

            return currentTime >= inPointSeconds && currentTime <= outPointSeconds;
        }
    )[0];

    if (!isNullOrUndefined(subtitleByCurrentTime)) {
        const { textVersions, speakerInitials } = subtitleByCurrentTime;

        const textInLanguage = textVersions.filter(({ languageCode }) => {
            return languageCode === selectedLanguageCodeForSubtitles;
        })[0];

        return (
            <StyledSubtitle>
                {speakerInitials}: {textInLanguage.text}
            </StyledSubtitle>
        );
    } else {
        return <StyledSubtitle>&nbsp;</StyledSubtitle>;
    }
};
