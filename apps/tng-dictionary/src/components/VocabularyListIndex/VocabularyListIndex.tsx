import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Loading from '../Loading/Loading';
import './VocabularyListIndex.module.css';

type HasIdAndName = {
  id: string;
  name: string;
}

const getData = async (endpoint: string) => fetch(endpoint).then(response => response.json())

/* eslint-disable-next-line */
export interface VocabularyListIndexProps { }

export function VocabularyListIndex(props: VocabularyListIndexProps) {

  const [appState, setAppState] = useState({
    loading: false,
    vocabularyLists: null,
  });

  useEffect(() => {
    setAppState({ loading: true, vocabularyLists: null });
    const apiUrl = `http://localhost:3131/api/entities?type=vocabularyList`;
    fetch(apiUrl, { mode: 'cors' })
      .then((res) => res.json())
      .then((vocabularyLists) => {
        console.log({
          result: vocabularyLists
        })
        setAppState({ loading: false, vocabularyLists: vocabularyLists });
      }).catch(rej => console.log(rej))
  }, [setAppState]);

  if (!appState.vocabularyLists || appState.vocabularyLists === []) return <Loading nameToDisplay={'All Vocabulary Lists'} />

  const testTable = [{
    id: '1',
    vocabularyList: 'to eat'
  }]

  return (
    <div>
      <h1>Welcome to VocabularyLists INDEX</h1>
      {
        (appState.vocabularyLists as unknown as HasIdAndName[]).map((vocabularyList) =>
          <Link to={`/vocabularyLists/${vocabularyList.id}`}>
            <div>
              {`${vocabularyList.id}: ${vocabularyList.name}`}
            </div>
          </Link>
        )
      }
    </div>
  );
}

export default VocabularyListIndex;
