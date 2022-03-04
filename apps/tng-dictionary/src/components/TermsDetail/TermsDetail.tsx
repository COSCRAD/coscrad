import './TermsDetail.module.css';
import * as React from 'react';
import { Card, CardContent, Divider, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import VocabularyListDetail from '../VocabularyListDetail/VocabularyListDetail';
import VolumeUpTwoToneIcon from '@mui/icons-material/VolumeUpTwoTone';
import TermData, { Term } from '../Term/Term';
import Loading from '../Loading/Loading';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import InfoTwoToneIcon from '@mui/icons-material/InfoTwoTone';
import KeyboardReturnTwoToneIcon from '@mui/icons-material/KeyboardReturnTwoTone';
import Button from '@mui/material/Button';
import { Link } from "react-router-dom";

/* eslint-disable-next-line */
export interface TermsDetailComponentProps { }

type ComponentState = {
  termData: null | TermData;
}

export function TermsDetailComponent(props: TermsDetailComponentProps) {

  const [componentState, setComponentState] = useState<ComponentState>({
    termData: null
  })

  const { id } = useParams();

  useEffect(() => {
    setComponentState({ termData: null });

    const apiUrl = `http://localhost:3131/api/entities?type=term&id=${id}`;
    fetch(apiUrl, { mode: 'cors' })
      .then((res) => res.json())
      .then((term) => {
        setComponentState({ termData: term });
      }).catch(rej => console.log(rej))
  }, [setComponentState]);

  if (!componentState.termData) return (
    <Loading></Loading>
  );

  return (
    <div style={{ textAlign: 'center', alignContent: 'center', margin: '0 auto', alignSelf: 'center', color: 'white', padding: '0px' }}>

      <div className='termindex' >
        <h1 style={{ lineHeight: '0px' }}>Term <InfoTwoToneIcon /></h1>
        <div style={{ paddingBottom: '29px' }}>
          <Link to="/terms">
            <motion.div
              whileHover={{ scale: 1.05, }}
              whileTap={{ scale: 0.95 }}>
              <Button variant="contained" style={style2} >
                Back <KeyboardReturnTwoToneIcon />
              </Button>
            </motion.div>
          </Link>

        </div>


      </div>


      <Card sx={{ width: '100vw', minHeight: '100vh', margin: '0 auto' }}>
        <div style={{ padding: '2px', paddingTop: '20px' }}>
          <Card className="Cards" sx={{ minHeight: '250px' }}>
            <CardContent>
              <Term termData={componentState.termData}></Term>
            </CardContent>
          </Card>
        </div>
      </Card>
    </div >

  );
}

export default TermsDetailComponent;

const style = {
  marginBottom: 1.5,
  textAlign: 'left',
} as const

const divider = {
  marginBottom: 1.5,
  background: 'rgb(150, 150, 150)'
}

const play = {
  fontSize: '38px',
  verticalAlign: 'bottom'
}

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

// sx={{ color: 'rgb(159,2,2)', bgcolor: 'white', whiteSpace: 'pre-wrap', borderRadius: '24px', borderColor: 'white', height: '54px', minWidth: '150px' }}