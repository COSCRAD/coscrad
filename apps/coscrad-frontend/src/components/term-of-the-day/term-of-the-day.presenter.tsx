import { ICategorizableDetailQueryResult, ITermViewModel } from '@coscrad/api-interfaces';
import { Typography } from '@mui/material';
import { TermDetailFullViewPresenter } from '../resources/terms/term-detail.full-view.presenter';
import { StyledTermOfTheDay } from './term-of-the-day-styled';
import { MonthAndDate } from './use-date';

interface TermOfTheDayPresenterProps {
    termProps: ICategorizableDetailQueryResult<ITermViewModel>;
    monthAndDate: MonthAndDate;
}

export const TermOfTheDayPresenter = ({
    monthAndDate: { month, date },
    termProps,
}: TermOfTheDayPresenterProps): JSX.Element => {
    return (
        <StyledTermOfTheDay>
            <Typography variant="h3">Term of the day</Typography>
            <TermDetailFullViewPresenter {...termProps} />
            <Typography variant="h4">
                {month} {date}
            </Typography>
        </StyledTermOfTheDay>
    );
};
