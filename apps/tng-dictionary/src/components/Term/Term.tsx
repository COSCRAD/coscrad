import './Term.module.css';
import * as React from 'react';
import { Divider, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import VolumeUpTwoToneIcon from '@mui/icons-material/VolumeUpTwoTone';
import ErrorTwoToneIcon from '@mui/icons-material/ErrorTwoTone';

// TODO move this to shared interfaces lib
export type TermData = {
  id: string;

  contributor: string;

  term: string;

  termEnglish?: string;

  audioURL?: string;

  sourceProject?: string;
}

/* eslint-disable-next-line */
export interface TermsDetailComponentProps {
  termData?: TermData
}

export function Term(props: TermsDetailComponentProps) {
  const audioRef = React.useRef();

  const { termData } = props;

  if (!termData) return (
    <div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1 }}>
        <div className='termNot'>
          <h1> Term not found <ErrorTwoToneIcon /></h1>
          <h2>Lha ts'egwediʔal</h2>
          <h2>"One couldn't find the word."</h2>
        </div>
      </motion.div>
    </div>
  );

  const {
    id, contributor, term, termEnglish, audioURL
  } = termData;

  /* AUDIO PLAYER */
  let audio = new Audio(`${audioURL}`)

  const start = () => {
    audio.play().catch(console.log)
  }

  return (

    <div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1 }}>
        <Typography className='termTitle' variant='h5'>
          <b>{term}</b>
          <motion.div
            whileHover={{ scale: 1.2, }}
            whileTap={{ scale: 0.95 }}
            className='motionDiv'
          >
            <VolumeUpTwoToneIcon style={play} key={audioURL} onClick={start} />
          </motion.div>
        </Typography>
        {/* Don't add a div if there's no termEnglish */}
        <Divider className='divider' />
        <div className='termClass' >
          <div className='termInfo'>English:&nbsp; </div> {termEnglish ? termEnglish : ''}
        </div>
        <div className='termClass'>
          <div className='termInfo'>Contributor:&nbsp;</div>{` ${contributor}`}
        </div>
        <div className='termClass'>
          {`Term ID: ${id}`}
        </div>
        <div>
          {/* Don't render this if there is no valid source */}
          { /* <a href={`${audioURL}`} target="_blank">audio</a>*/}
        </div>
        <br />
        <br />
      </motion.div>
    </div>
  );
}

export default TermData;


const play = {
  fontSize: '38px',
  verticalAlign: 'bottom'
}