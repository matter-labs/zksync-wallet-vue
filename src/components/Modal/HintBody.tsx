import React from 'react';
import { observer } from 'mobx-react-lite';
import { useStore } from 'src/store/context';

export const HintBody: React.FC = observer(
  (): JSX.Element => {
    const { modalHintMessage } = useStore();
    return (
      <div>
        {modalHintMessage === 'test' && (
          <>
            <h4>
              {
                'Your zkSync address is the same as your Ethereum account address.'
              }
            </h4>
            <p>
              {
                'As long as you control your Ethereum account you also own all the L2 balances under its address in zkSync. Nobody can freeze or take them away from you. Once your balance has been verified ('
              }
              <span className='label-done small'></span>
              {
                '), you can always recover your tokens from zkSync — even if its validators are ever shut down.'
              }{' '}
              <a
                href='//zksync.io/faq/security.html'
                target='_blank'
                rel='noopener noreferrer'
              >
                {'Learn more.'}
              </a>{' '}
            </p>
          </>
        )}
      </div>
    );
  },
);

export default HintBody;
