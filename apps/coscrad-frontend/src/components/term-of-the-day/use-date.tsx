export function useDate() {

    const currentDay = (new Date()).getDate();

    console.log('TODAYS DAY:', currentDay)

    return currentDay;
};

