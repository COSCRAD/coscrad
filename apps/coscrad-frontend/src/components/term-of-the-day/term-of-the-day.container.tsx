import { useContext } from 'react';
import { ConfigurableContentContext } from '../../configurable-front-matter/configurable-content-provider';
import { useLoadableTermById } from '../../store/slices/resources';
import { TermOfTheDayPresenter } from './term-of-the-day.presenter';

export const TermOfTheDayContainer = (): JSX.Element => {

    //get termOfTheDay from config instead of hardwired const termArray
    const { termOfTheDay } = useContext(ConfigurableContentContext);

    // const termArray: string[] = [
    //     "9b1deb4d-3b7d-4bad-9bdd-2b0d7b110001",
    //     "9b1deb4d-3b7d-4bad-9bdd-2b0d7b110002",
    //     "9b1deb4d-3b7d-4bad-9bdd-2b0d7b110511",
    //     "9b1deb4d-3b7d-4bad-9bdd-2b0d7b110512",
    //     "9b1deb4d-3b7d-4bad-9bdd-2b0d7b110513",
    //     "9b1deb4d-3b7d-4bad-9bdd-2b0d7b110501",
    //     "9b1deb4d-3b7d-4bad-9bdd-2b0d7b110502"
    // ];

    // #TODO Change from random to select specific day

    const randomIndex = Math.floor(Math.random() * termOfTheDay.length);
    const randomTerm = termOfTheDay[randomIndex];

    // useEffect(() => {
    //     pull from redux, dont hit an endpoint outside of redux
    //     use useLoadableTermById(todaysId)
    //     const apiUrl = `http://localhost:3131/api/resources/terms/${randomTerm}`

    //     fetch(apiUrl, { mode: 'cors' })
    //         .then(response => response.json())
    //         .then(data => (data))
    //         .catch(error => console.error(error));
    // }, []);

    const getTermOfTheDay = useLoadableTermById(randomTerm)

    console.log(getTermOfTheDay)

    return (
        <div>
            <TermOfTheDayPresenter {...getTermOfTheDay} termOfTheDay={termOfTheDay} />
        </div>
    );
}
