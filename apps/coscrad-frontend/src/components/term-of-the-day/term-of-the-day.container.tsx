import { useContext } from 'react';
import { ConfigurableContentContext } from '../../configurable-front-matter/configurable-content-provider';
import { useLoadableTermById } from '../../store/slices/resources';
import { useDate } from './use-date';

export const TermOfTheDayContainer = (): JSX.Element => {
    const { termOfTheDayConfig } = useContext(ConfigurableContentContext);

    const getCurrentTermOfTheDay = useDate();

    const termOfTheDayId = termOfTheDayConfig[getCurrentTermOfTheDay];

    const loadableTermSearchResult = useLoadableTermById(termOfTheDayId);

    return <div>{termOfTheDayId}</div>;

    // const Presenter = displayLoadableSearchResult(TermDetailFullViewPresenter);

    // console.log(termOfTheDayId);

    // return <Presenter {...loadableTermSearchResult} />;
};
