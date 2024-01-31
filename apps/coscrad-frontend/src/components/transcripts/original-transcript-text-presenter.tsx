import { LanguageCode } from '@coscrad/api-interfaces';
import { Tooltip, Typography } from '@mui/material';

export interface OriginalTranscriptTextPresenterProps {
    text: string;
    languageCode: LanguageCode;
    inPointMilliseconds: number;
    outPointMilliseconds: number;
    speakerInitials: string;
    // speakerName: string;
}

export const OriginalTranscriptTextPresenter = ({
    text,
    languageCode,
    inPointMilliseconds,
    outPointMilliseconds,
    speakerInitials,
}: OriginalTranscriptTextPresenterProps) => {
    return (
        <Tooltip title={languageCode}>
            <Typography variant="body1">
                <div>
                    [{inPointMilliseconds}]
                    <Tooltip title={`We need to add speaker name`}>
                        <span>[{speakerInitials}]</span>
                    </Tooltip>
                </div>
                <p>{text}</p>
                <div>[{outPointMilliseconds}]</div>
            </Typography>
        </Tooltip>
    );
};
