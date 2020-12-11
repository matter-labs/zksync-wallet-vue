import React from 'react';
import '@lottiefiles/lottie-player';
import successCheckmark from 'images/success-checkmark.json';

export const LottiePlayer = () => (
  <div className='success-lottie-checkmark'>
    <lottie-player
      src={JSON.stringify(successCheckmark)}
      autoplay='autoplay'
      background='transparent'
      speed='1'
      style={{ width: '200px', height: '200px' }}
    />
  </div>
);
