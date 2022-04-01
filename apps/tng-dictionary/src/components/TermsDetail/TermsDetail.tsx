import InfoTwoToneIcon from '@mui/icons-material/InfoTwoTone';
import KeyboardReturnTwoToneIcon from '@mui/icons-material/KeyboardReturnTwoTone';
import { Card, CardContent } from '@mui/material';
import Button from '@mui/material/Button';
import { motion } from 'framer-motion';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Loading from '../Loading/Loading';
import TermData, { Term } from '../Term/Term';
import './TermsDetail.module.css';

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

    const apiUrl = `http://localhost:3131/api/entities/terms/${id}`;
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

    <div className='backgroundTerm'>
      <div className='termindex'>
        <section style={{ paddingBottom: '28px' }}>
          <h1 style={{ lineHeight: '0px' }}>Term <InfoTwoToneIcon className='headerIcon' /></h1>
          <div>
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
        </section>
      </div>

      <Card className='background'>
        <div className='CardsWrapper'>
          <Card className="Cards">
            <CardContent>
              <Term termData={componentState.termData}></Term>
            </CardContent>
          </Card>
        </div>
      </Card>
    </div>

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