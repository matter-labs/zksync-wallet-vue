import React from 'react';
import { observer } from 'mobx-react-lite';
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { fas } from '@fortawesome/free-solid-svg-icons';

import {
  LINKS_CONFIG,
  FAUCET_TOKEN_API,
  ETH_MINT_ADDRESS,
  ABI_DEFAULT_INTERFACE,
} from 'src/config';

import {
  handleFormatToken,
  handleExponentialNumbers,
  intervalAsyncStateUpdater,
  loadTokens,
  sortBalancesById,
  mintTestERC20Tokens,
  addressMiddleCutter,
  useCallbackWrapper,
} from 'src/utils';

import { CopyBlock } from 'src/components/Common/CopyBlock';

import { useStore } from 'src/store/context';

library.add(fas);

export const AmountToWithdraw = observer(() => {
  const store = useStore();

  const mainContract = store.zkWallet?.provider.contractAddress.mainContract;
  const etherscanContracLink = `//${LINKS_CONFIG.ethBlockExplorer}/address/${mainContract}#writeProxyContract`;

  const { TransactionStore, AccountStore } = store;

  return (
    <div className='scroll-content'>
      <h2 className='transaction-title'>{`Start withdrawing ${TransactionStore.symbolName}`}</h2>
      <h3>
        {'Amount to withdraw: '}
        {TransactionStore.maxValue}
      </h3>
      <p>
        {
          'At the moment, we only support withdrawals to L1 for external wallets.'
        }
      </p>
      <p>{`A withdrawal is performed in 2 steps. First, a FullExit transaction must initiated from your account (${addressMiddleCutter(
        store.zkWallet?.address() as string,
        6,
        4,
      )}) — the details are provided below.`}</p>
      <p>
        {
          'After the transaction is mined, the token balance will disappear from the list until the next rollup block is verified (maximum 3 hours). Once this happens, the balance will re-appear in this UI with a button to complete your withdrawal.'
        }
      </p>
      <div className='grey-block'>
        <h3>{'Contract:'}</h3>
        <p className='external-argument'>
          {'Address ('}
          <a target='_blank' href={etherscanContracLink}>
            {'View on Etherscan '}
            <FontAwesomeIcon icon={['fas', 'external-link-alt']} />
          </a>
          {')'}
        </p>
        <CopyBlock copyProp={mainContract}>
          <p>{mainContract}</p>
        </CopyBlock>
        <p className='external-argument'>{'ABI'}</p>
        <CopyBlock
          text={`${store.abiText?.substring(0, 40)}...`}
          copyProp={store.abiText}
        />
        <h3>{'Method:'}</h3>
        <CopyBlock text={'fullExit'} />
        <h3>{'Arguments:'}</h3>
        <p className='external-argument'>{'_accountId (uint32)'}</p>
        <CopyBlock text={AccountStore.accountId} />
        <p className='external-argument'>{'_token (address)'}</p>
        <CopyBlock text={TransactionStore.tokenAddress} />
      </div>
    </div>
  );
});

export const CompleteWithdrawal = observer(() => {
  const store = useStore();

  const mainContract = store.zkWallet?.provider.contractAddress.mainContract;
  const etherscanContracLink = `//${LINKS_CONFIG.ethBlockExplorer}/address/${mainContract}#writeProxyContract`;

  const { ExternaWalletStore, TransactionStore } = store;

  return (
    <div className='scroll-content'>
      <h2 className='transaction-title'>{`Complete withdrawal ${TransactionStore.symbolName}`}</h2>
      <div className='grey-block'>
        <h3>{'Contract:'}</h3>
        <p className='external-argument'>
          {'Address ('}
          <a target='_blank' href={etherscanContracLink}>
            {'View on Etherscan '}
            <FontAwesomeIcon icon={['fas', 'external-link-alt']} />
          </a>
          {')'}
        </p>
        <CopyBlock copyProp={mainContract}>
          <p>{mainContract}</p>
        </CopyBlock>
        <p className='external-argument'>{'ABI'}</p>
        <CopyBlock
          text={`${store.abiText?.substring(0, 40)}...`}
          copyProp={store.abiText}
        />
        <h3>{'Method:'}</h3>
        <CopyBlock
          text={
            TransactionStore.symbolName === 'ETH'
              ? 'withdrawETH'
              : 'withdrawERC20'
          }
        />
        <h3>{'Arguments:'}</h3>
        {TransactionStore.symbolName !== 'ETH' && (
          <>
            <p className='external-argument'>{'_token (address)'}</p>
            <CopyBlock text={TransactionStore.tokenAddress} />
          </>
        )}
        <p className='external-argument'>{'_amount (uint128)'}</p>
        <CopyBlock
          text={
            ExternaWalletStore.externalWalletContractBalances[
              TransactionStore.symbolName
            ] &&
            handleExponentialNumbers(
              ExternaWalletStore.externalWalletContractBalances[
                TransactionStore.symbolName
              ],
            )
          }
        />
      </div>
    </div>
  );
});
