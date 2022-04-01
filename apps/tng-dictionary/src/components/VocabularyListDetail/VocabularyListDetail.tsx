import InfoTwoToneIcon from '@mui/icons-material/InfoTwoTone';
import KeyboardReturnTwoToneIcon from '@mui/icons-material/KeyboardReturnTwoTone';
import { Card } from '@mui/material';
import Button from '@mui/material/Button';
import { motion } from 'framer-motion';
import { useContext, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import VocabularyListContext, { buildUnselectedFormData } from '../../context/VocabularyListContext';
import doValuesMatchFilters from '../../utilities/doValuesMatchFilters';
import removeNoSelectionValuedPropsFromFilters from '../../utilities/removeNoSelectionValuedPropsFromFilters';
import Carousel from '../Carousel/Carousel';
import Loading from '../Loading/Loading';
import TermData from '../Term/Term';
import VocabularyListForm, { VocabularyListFormElement } from '../VocabularyListForm/VocabularyListForm';
import './VocabularyListDetail.module.css';



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

    const apiUrl = `http://localhost:3131/api/entities/vocabularyLists/${id}`;
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
    <div className='vocabError' >
      <section className='vocabHeader'>

        <h1 style={{ lineHeight: '0px' }}>Vocabulary List <InfoTwoToneIcon className='headerIcon' /></h1>
        <div>
          <Link to="/vocabularyLists">
            <motion.div
              whileHover={{ scale: 1.05, }}
              whileTap={{ scale: 0.95 }}>
              <Button variant="contained" style={style2} >
                Back <KeyboardReturnTwoToneIcon />
              </Button>
            </motion.div>
          </Link>
        </div>

      </section >
      {/* TODO remove all casts */}
      < div className='background' >
        <VocabularyListForm formItems={(appState.vocabularyList as unknown as any).variables} />

        <Card className='Cards'>
          <div className='vocabNot'>
            <h1> Term not found.</h1>
            <h2>Lha ts'egwediʔal</h2>
            <h2>"One couldn't find the word."</h2>
          </div>
        </Card>
      </div >
    </div >
  )
  // Extract terms from entries into separate term array
  // const allTerms = appState.vocabularyList.entries.map(({ term }: { term: Term }) => term);

  return (

    <div className='background' style={center}>
      <div className='termindex'>
        <section className='sections'>
          <h1 style={{ lineHeight: '0px' }}>Vocabulary List <InfoTwoToneIcon className='headerIcon' /></h1>
          <div>
            <Link to="/VocabularyLists">
              <motion.div
                whileHover={{ scale: 1.05, }}
                whileTap={{ scale: 0.95 }}>
                <Button variant="contained" style={style2} >
                  Back <KeyboardReturnTwoToneIcon />
                </Button>
              </motion.div>
            </Link>
          </div>
        </section>
      </div>
      {/* <p>Vocabulary List: {id}</p> */}
      {/*
            <h1>
        {`${(appState.vocabularyList as unknown as HasIdAndName).id}: ${(appState.vocabularyList as unknown as HasIdAndName).name}`}
      </h1>
      */}
      {/*
      <Typography sx={{ mb: 1.5, color: 'rgb(159,2,2)' }} variant='h5'>
        <b>
          {`${(appState.vocabularyList as unknown as HasIdAndName).id}: ${(appState.vocabularyList as unknown as HasIdAndName).name}`}
        </b>
        <motion.div
          whileHover={{ scale: 1.2, }}
          whileTap={{ scale: 0.95 }}
          style={{ width: 'fit-content', display: 'inline-block', paddingLeft: '5px' }}>
        </motion.div>
      </Typography>
      <Divider style={divider} />
*/}

      {/* TODO remove all casts */}
      {/* TODO Complete form filtering feature */}

      <VocabularyListForm formItems={(appState.vocabularyList as unknown as any).variables} />
      <div><Carousel data={selectedTerms} /></div>
    </div>
  );
}

export default VocabularyListDetail;

const center = {
  position: 'absolute',
  height: '100vh',
  width: '100vw',
  textAlign: 'center',
  //  background: 'white',
  overflowX: 'scroll',
  paddingBottom: '100px'
} as const

const style2 = {
  width: 180,
  borderColor: 'rgb(159,2,2)',
  color: 'rgb(159,2,2)',
  height: '54px',
  margin: '5px',
  background: 'white',
  borderRadius: '36px',
  whiteSpace: 'pre-wrap'
} as const

const divider = {
  marginBottom: 1.5,
  background: 'rgb(150, 150, 150)'
}