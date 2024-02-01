import { Tooltip } from '@mui/material';
import { TimelineMark } from './timeline';

export interface TimelineLabelProps {
    text: string;
    tip: string;
    value: number;
    onClick?: (timeStamp: number) => void;
}

export const TimelineLabel = ({ text, tip, value, onClick }: TimelineLabelProps): JSX.Element => {
    return (
        <Tooltip title={tip}>
            {/* Do we really need the value param here? the client already has access to this */}
            <div
                onClick={() => {
                    onClick(value);
                }}
            >
                {text}
            </div>
        </Tooltip>
    );
};

/**
 * We have followed the API set by React MUI's `Slider`. This api requires
 * a value and a rich (i.e., `ReactNode`) label. This helper packages a label
 * into a mark data structure.
 */
export const buildTimelineMark = (props: TimelineLabelProps): TimelineMark => {
    const { value } = props;

    return {
        value,
        label: TimelineLabel(props),
    };
};
