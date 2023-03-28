const months = [
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
] as const;

export type Month = typeof months[number];

export type MonthAndDate = {
    month: Month;
    date: number;
};

export function useDate(): MonthAndDate {
    const currentDate = new Date();

    return {
        month: months[currentDate.getMonth()],
        date: currentDate.getDate(),
    };
}
