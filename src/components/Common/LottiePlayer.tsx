import React from 'react';
import '@lottiefiles/lottie-player';

export const LottiePlayer = ({ src }) => (
  <div className='success-lottie-checkmark'>
    {/* eslint-disable-next-line @typescript-eslint/ban-ts-ignore */}
    {/*
      // @ts-ignore */}
    <lottie-player
      src={src}
      autoplay="autoplay"
      background='transparent'
      speed='1'
      style={{ width: '200px', height: '200px' }}
    />
  </div>
);
