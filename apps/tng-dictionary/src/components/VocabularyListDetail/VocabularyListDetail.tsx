import { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import VocabularyListContext, { buildUnselectedFormData, FormItemValue, MaybeSelected } from '../../context/VocabularyListContext';
import doValuesMatchFilters from '../../utilities/doValuesMatchFilters';
import Loading from '../Loading/Loading';
import VocabularyListForm, { VocabularyListFormElement } from '../VocabularyListForm/VocabularyListForm';
import './VocabularyListDetail.module.css';
import Carousel from '../Carousel/Carousel';
import removeNoSelectionValuedPropsFromFilters from '../../utilities/removeNoSelectionValuedPropsFromFilters';
import TermData from '../Term/Term';



type HasIdAndName = {
  id: string;
  name: string;
}

const getData = async (endpoint: string) => fetch(endpoint).then(response => response.json())

type VocabularyListEntry = {
  term: TermData;
  variableValues: Record<string, string | boolean>;
}

type VocabularyList = HasIdAndName & {
  nameEnglish?: string;
  variables: VocabularyListFormElement[];
  entries: VocabularyListEntry[];
}


const filterEntriesForSelectedTerms = (allEntries: VocabularyListEntry[], filters: Record<string, string | boolean>): TermData[] =>
  allEntries.filter(({ variableValues }) => doValuesMatchFilters(variableValues, filters)).map(({ term }) => term)

type ComponentState = {
  loading: boolean;
  vocabularyList: null | VocabularyList;
}

/* eslint-disable-next-line */
export interface VocabularyListDetailProps { }

export function VocabularyListDetail(props: VocabularyListDetailProps) {

  const [form, setFormState] = useContext(VocabularyListContext);

  const [appState, setAppState] = useState<ComponentState>({
    loading: false,
    vocabularyList: null,
  });

  const { id } = useParams();

  useEffect(() => {
    setAppState({ loading: true, vocabularyList: null });

    const apiUrl = `http://localhost:3131/api/entities?type=vocabularyList&id=${id}`;
    fetch(apiUrl, { mode: 'cors' })
      .then((res) => res.json())
      .then((vocabularyList) => {
        setAppState({ loading: false, vocabularyList: vocabularyList });

        // Reset the form on the first loading of the detail page
        setFormState({
          currentSelections: buildUnselectedFormData(appState.vocabularyList?.variables.map(({ name }) => name))
        })
      }).catch(rej => console.log(rej))
  }, [setAppState]);

  if (!appState.vocabularyList) return <div>
    <Loading />
  </div>

  const allEntries = (appState.vocabularyList as unknown as any).entries;

  const selectedTerms = filterEntriesForSelectedTerms(allEntries, removeNoSelectionValuedPropsFromFilters(form.currentSelections));

  console.log({
    filters: removeNoSelectionValuedPropsFromFilters(form.currentSelections)
  })

  if (!selectedTerms.length) return (
    <div className='home'>
      <p>Vocabulary List: {id}</p>
      <p>
        {`${(appState.vocabularyList as unknown as HasIdAndName).id}: ${(appState.vocabularyList as unknown as HasIdAndName).name}`}
      </p>
      <h1>Selected Term</h1>
      {/* TODO remove all casts */}
      <VocabularyListForm formItems={(appState.vocabularyList as unknown as any).variables} />
      Term not found. Please search again.
    </div>
  )
  // Extract terms from entries into separate term array
  // const allTerms = appState.vocabularyList.entries.map(({ term }: { term: Term }) => term);

  return (

    <div style={center}>
      {/* <p>Vocabulary List: {id}</p> */}
      <h1 style={{ color: 'white' }}>
        {`${(appState.vocabularyList as unknown as HasIdAndName).id}: ${(appState.vocabularyList as unknown as HasIdAndName).name}`}
      </h1>
      {/* TODO remove all casts */}
      {/* TODO Complete form filtering feature */}
      <VocabularyListForm formItems={(appState.vocabularyList as unknown as any).variables} />
      <div><Carousel data={selectedTerms} /></div>
    </div >
  );
}

export default VocabularyListDetail;

const center = {
  position: 'absolute',
  height: '90vh',
  width: '100vw',
  background: 'inherit',
  textAlign: 'center'
} as const
