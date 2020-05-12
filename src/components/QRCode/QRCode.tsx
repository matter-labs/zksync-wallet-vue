import React, { FC, useState } from 'react';
import qrcode from 'qrcode-generator';

import { useMobxEffect } from 'src/hooks/useMobxEffect';

interface Props {
  data: string;
}

export const QRCode: FC<Props> = ({ data }) => {
  const [imgTag, setImgTag] = useState('');

  useMobxEffect(() => {
    const qr = qrcode(4, 'L');
    qr.addData(data);
    qr.make();
    setImgTag(qr.createImgTag(6, 6));
  }, [data]);

  return (
    <div className='wallet-qr' dangerouslySetInnerHTML={{ __html: imgTag }} />
  );
};
