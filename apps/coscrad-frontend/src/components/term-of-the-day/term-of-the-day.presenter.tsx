import { ICategorizableDetailQueryResult, ITermViewModel } from '@coscrad/api-interfaces';
import { Typography } from '@mui/material';
import { TermDetailFullViewPresenter } from '../resources/terms/term-detail.full-view.presenter';
import {
    TermOfTheDayContainerStyled,
    TermOfTheDayCurrentDate,
    TermOfTheDayHeader,
} from './term-of-the-day-styled';
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
        <TermOfTheDayContainerStyled>
            <TermOfTheDayHeader>Term of the day</TermOfTheDayHeader>
            <Typography>
                <TermDetailFullViewPresenter {...termProps} />
            </Typography>
            <TermOfTheDayCurrentDate>
                {month} {date}
            </TermOfTheDayCurrentDate>
        </TermOfTheDayContainerStyled>
    );
};
