import { useState } from 'react';
import './Carousel.module.css';
import ArrowBackIosNewOutlinedIcon from '@mui/icons-material/ArrowBackIosNewOutlined';
import ArrowForwardIosOutlinedIcon from '@mui/icons-material/ArrowForwardIosOutlined';
import { Divider } from '@mui/material';
import { Card } from '@mui/material';
import { CardContent } from '@mui/material';
import { Button } from '@mui/material';
import { AnimatePresence, motion } from 'framer-motion';
import TermData, { Term } from '../Term/Term';


/* eslint-disable-next-line */
export interface CarouselProps {
  data: TermData[]
}

const cyclicDecrement = (currentIndex: number, max: number): number => {
  const newIndex = currentIndex - 1;

  if (newIndex === -1) return max;

  return newIndex;
}

const cyclicIncrement = (currentIndex: number, max: number): number => {
  const newIndex = currentIndex + 1;

  if (newIndex > max) return 0;

  return newIndex;
}

/**
 * 
 * TODO [refactor] Make Carousel a higher-order component which takes in 
 * props and a component to wrap so we can reuse this behaviour.
 */
export function Carousel(props: CarouselProps) {

  const [currentIndex, setIndex] = useState(0)

  if (props.data.length === 0) return (
    <p>No Data</p>
  )

  const currentItem: TermData = props.data[currentIndex];

  const [isToggled, setToggle] = useState(1);

  return (


    <AnimatePresence>

      <Card className="Cards">
        <CardContent>
          <motion.div key={currentIndex} initial={{ x: isToggled }} animate={{ x: 0, y: 0, scale: 1, rotate: 0, }} exit={{ x: 12, y: 0, scale: 1, rotate: 0, }} transition={{ duration: 1 }}>
            <Term termData={currentItem} />
            <Divider className='Divider' />
          </motion.div>

          <div className='carouselButtons'>
            <motion.div onClick={() => setToggle(prevValue => {
              return prevValue ? -200 : -200;
            })} whileHover={{ scale: 1.2, transition: { duration: 0.1 } }}
              whileTap={{ scale: 0.9 }}>
              <Button className='clicker' disableRipple={true} onClick={e => setIndex(cyclicDecrement(currentIndex, props.data.length - 1))}><ArrowBackIosNewOutlinedIcon /> Back</Button>
            </motion.div>
            <motion.div onClick={() => setToggle(prevValue => {
              return prevValue ? 200 : 200;
            })} whileHover={{ scale: 1.1, transition: { duration: 0.1 } }}
              whileTap={{ scale: 0.9 }}>
              <Button className='clicker' disableRipple={true} onClick={e => setIndex(cyclicIncrement(currentIndex, props.data.length - 1))}>Next <ArrowForwardIosOutlinedIcon /></Button>
            </motion.div>
          </div>

        </CardContent>
      </Card>

    </AnimatePresence>

  );
}

export default Carousel;


