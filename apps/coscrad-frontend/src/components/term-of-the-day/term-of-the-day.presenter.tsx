import { ICategorizableDetailQueryResult, ITermViewModel } from '@coscrad/api-interfaces';
import { TermDetailFullViewPresenter } from '../resources/terms/term-detail.full-view.presenter';
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
        <div>
            <h1>Term of the day</h1>

            <div>
                {month} {date}
            </div>
            <div>
                <TermDetailFullViewPresenter {...termProps} />
            </div>
        </div>
    );
};
