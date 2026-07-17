interface TruncateTextForDisplayProps {
    text: string;
    limit: number;
}

export const TruncateTextForDisplay = ({
    text,
    limit,
}: TruncateTextForDisplayProps): JSX.Element => (
    <>{text.split(' ').map((word, index) => (index < limit ? `${word} ` : ''))}&hellip;</>
);
