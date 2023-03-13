import { ICategorizableDetailQueryResult, ITermViewModel } from '@coscrad/api-interfaces';
import { useEffect, useState } from 'react';
import { TermDetailFullViewPresenter } from '../resources/terms/term-detail.full-view.presenter';

export interface TermsDetailComponentProps { }

export function TermOfTheDay(props: TermsDetailComponentProps): JSX.Element {

    const [term, setTerm] = useState<ICategorizableDetailQueryResult<ITermViewModel> | null>(null);

    const termArray: string[] = [
        "9b1deb4d-3b7d-4bad-9bdd-2b0d7b110001",
        "9b1deb4d-3b7d-4bad-9bdd-2b0d7b110002",
        "9b1deb4d-3b7d-4bad-9bdd-2b0d7b110511",
        "9b1deb4d-3b7d-4bad-9bdd-2b0d7b110512",
        "9b1deb4d-3b7d-4bad-9bdd-2b0d7b110513",
        "9b1deb4d-3b7d-4bad-9bdd-2b0d7b110501",
        "9b1deb4d-3b7d-4bad-9bdd-2b0d7b110502"
    ];
    const randomIndex = Math.floor(Math.random() * termArray.length);
    const randomTerm = termArray[randomIndex];

    useEffect(() => {
        //pull from redux, dont hit an endpoint out of redux
        const apiUrl = `http://localhost:3131/api/resources/terms/${randomTerm}`

        fetch(apiUrl, { mode: 'cors' })
            .then(response => response.json())
            .then(data => setTerm(data))
            .catch(error => console.error(error));
    }, []);

    const today: Date = new Date();
    const year: number = today.getFullYear();
    const month: number = today.getMonth() + 1;
    const day: number = today.getDate();

    const monthNames = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
    ];

    const monthName = monthNames[month - 1];

    return (
        <div>
            <div>TERM OF THE DAY </div>
            {term ? <TermDetailFullViewPresenter term={term.term} termEnglish={term.termEnglish} audioURL={term.audioURL} contributor={term.contributor} id={term.id} tags={term.tags} actions={term.actions} /> : null}
            <div>{monthName} {day}, {year}</div>
        </div>
    );
}
