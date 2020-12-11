import React from 'react';
import { Player } from '@lottiefiles/react-lottie-player';

import successCheckmark from 'images/success-checkmark.json';

export const LottiePlayer = () => (
  <div className='success-lottie-checkmark'>
    <Player
      autoplay={true}
      loop={true}
      controls={false}
      speed={1}
      src={JSON.stringify(successCheckmark)}
      style={{ height: '200px', width: '200px' }}
    ></Player>
  </div>
)
