import { TermOfTheDayContainer } from './term-of-the-day.container';

export const TermOfTheDayPresenter = (): JSX.Element => {
    const today: Date = new Date();

    const year: number = today.getFullYear();

    const month: number = today.getMonth() + 1;

    const day: number = today.getDate();

    const monthNames = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
    ];

    const monthName = monthNames[month - 1];

    return (
        <div>
            <h1>Term of the day</h1>
            <TermOfTheDayContainer />
            <div>
                {monthName} {day}, {year}
            </div>
        </div>
    );
};
