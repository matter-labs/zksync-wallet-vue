import React, { useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { useStore, storeContext } from 'src/store/context';
import { useHistory } from 'react-router-dom';
import crypto from 'crypto';
import { FAUCET_TOKEN_API } from 'src/config';
import useWalletInit from 'src/hooks/useWalletInit';
import Spinner from '../Spinner/Spinner';
import { useLogout } from 'hooks/useLogout';
import { ADDRESS_VALIDATION } from 'constants/regExs';
import './Modal.scss';

const MyWallet = () => (
  <>
    <h4>
      {'Your zkSync address is the same as your Ethereum account address.'}
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
);

const BalancesInL2 = () => {
  const history = useHistory();
  const store = useStore();
  return (
    <>
      <h4>{'zkSync is a Layer-2 protocol'}</h4>
      <p>
        {
          'Your zkSync balances live in a separate space called Layer-2 (L2 for short). You won’t see them on '
        }
        <a href='//etherscan.io' target='_blank' rel='noopener noreferrer'>
          {'etherscan.io'}
        </a>{' '}
        {
          ' or in your Ethereum wallet, only in zkSync wallet and block explorer. Nevertheless, balances in zkSync are as secure as if though they were in L1 (the Ethereum mainnet).'
        }{' '}
        <a
          href='//zksync.io/faq/security.html'
          target='_blank'
          rel='noopener noreferrer'
        >
          {'Learn more.'}
        </a>{' '}
      </p>
      <p>
        {'You can move your balances from L1 into zkSync by making a '}
        <a
          className='hint-link'
          onClick={() => {
            history.push('/deposit');
            store.modalHintMessage = '';
            store.modalSpecifier = '';
          }}
        >
          {'Deposit'}
        </a>
      </p>
      <p>
        {'To move them back from zkSync to L1 you can make a '}
        <a
          className='hint-link'
          onClick={() => {
            history.push('/withdraw');
            store.modalHintMessage = '';
            store.modalSpecifier = '';
          }}
        >
          {'Withdraw'}
        </a>
      </p>
    </>
  );
};

const ERC20UnlockHint = () => (
  <p>
    {
      'Click on the switch will call ERC20.approve() for our contract once in order to authorize token deposits.'
    }
  </p>
);

const ERC20UnlockHintUnlocked = () => (
  <p>{'Already unlocked. This only needs to be done once per token.'}</p>
);

const OtherWallets = () => (
  <p>
    {
      'zkSync already offers support for any Ethereum wallet: if you can sign a message, you can control your zkSync account. We are currently working on integrating this support nicely into the web client. If you need any assistance, please '
    }
    <a
      href='//zksync.io/contact.html'
      target='_blank'
      rel='noopener noreferrer'
    >
      {'contact'}
    </a>
    {' the Matter Labs team.'}
  </p>
);

const DoNoTSendToExchanges = () => (
  <>
    <p>
      {
        'You can transfer tokens in zkSync to any Ethereum address, even if it was never used with zkSync before. But your recepient must be able to fully control their address to claim the tokens.'
      }
    </p>
    <p>
      {
        'Therefore, please do not send tokens to the exchange accounts until integrations are in place (coming soon!)'
      }
    </p>
  </>
);

const MLTTonMainnet = () => (
  <p>
    {
      'MLTT trial token is currently unavailable om mainnet. You can try it on our '
    }
    <a href='//rinkeby.zksync.io/' target='_blank' rel='noopener noreferrer'>
      {'Rinkeby testnet'}
    </a>{' '}
    {' for now.'}
  </p>
);

const WalletConnectLater = () => (
  <p>
    {'WalletConnect will be enabled on mainnet shortly! You can try it on our '}
    <a href='//testnet.zksync.io' target='_blank' rel='noopener noreferrer'>
      {'Rinkeby testnet'}
    </a>{' '}
    {' for now.'}
  </p>
);

const UnlinkCoinBase = () => {
  const store = useStore();

  return (
    <>
      <p>
        {
          'If you are meeting some troubles or want to change your coinbase wallet you can unlink the current account and scan QR code again.'
        }
      </p>
      <button
        onClick={() => store.walletLinkObject.deactivate()}
        className='btn btn-cancel btn-tr center'
      >
        {'Unlink account'}
      </button>
    </>
  );
};

const MakeTwitToWithdraw = observer(() => {
  const store = useStore();

  const generateSalt = () => {
    if (!!localStorage.getItem('twitsalt')) {
      const salt = localStorage.getItem('twitsalt');
      return salt;
    } else {
      const salt = Math.random().toString();
      localStorage.setItem('twitsalt', salt);
      return salt;
    }
  };

  const getTicketFromAddress = (salt: string) => {
    const preimage = (
      String(store.zkWallet?.address()).trim() + String(salt).trim()
    ).toLowerCase();

    const hash = crypto.createHash('sha256');
    hash.update(preimage);

    // 13 hex char numbers fit in a double
    const digest = hash.digest('hex').slice(0, 13);
    return parseInt(digest, 16)
      .toString()
      .padStart(16, '0');
  };

  const setAddress = () => {
    localStorage.setItem(`twittMade${store.zkWallet?.address()}`, 'true');
    store.modalHintMessage = '';
    store.modalSpecifier = '';
    fetch(
      `${FAUCET_TOKEN_API}/register_address/${store.zkWallet?.address()}/${generateSalt()}`,
    );
  };

  const claimText =
    'We grant free $MLTT to the first 500 users. To unlock a free withdrawal please tweet from your account with our pre-populated text. Your privacy is preserved as your pre-populated wallet address is hashed so no one can link your wallet to your social account. Once our bot detects your post, you will be able to claim your MLTT.';

  const withdrawText =
    'We grant free $MLTT mainnet withdrawals to the first 500 users. To unlock a free withdrawal please tweet from your account with our pre-populated text. Your privacy is preserved as your pre-populated wallet address is hashed so no one can link your wallet to your social account. Once our bot detects your post, you will be able to withdraw your MLTT to mainnet. ';

  return (
    <>
      <h2>
        {store.modalHintMessage === 'makeTwitToClaim'
          ? 'Matter Labs Trial Token'
          : 'Free $MLTT withdrawals'}
      </h2>
      <p>
        {store.modalHintMessage === 'makeTwitToClaim'
          ? claimText
          : withdrawText}
      </p>
      <a
        href={`https://twitter.com/intent/tweet?text=%40zksync%2C%20%40the_matter_labs%E2%80%99s%20zkRollup%20for%20trustless%2C%20scalable%20payments%20is%20now%20live%20on%20Ethereum%20mainnet%21%20%0A%0AGive%20it%20a%20try%3A%20%F0%9F%91%89%F0%9F%91%89%20zksync.io%20%0A%0AClaiming%20my%20trial%20tokens%3A%20${getTicketFromAddress(
          generateSalt() as string,
        )}`}
        onClick={setAddress}
        target='_blank'
        className='btn submit-button twitter margin'
      >
        <span className='twitter'></span>
        {'Tweet'}
      </a>
    </>
  );
});

const TroubleSeeingAToken = () => (
  <p>
    {
      'zkSync currently supports the most popular tokens, we will be adding more over time. '
    }
    <a
      href='//zksync.io/contact.html'
      target='_blank'
      rel='noopener noreferrer'
    >
      {'Let us know what tokens you need'}
    </a>
    {'!'}
  </p>
);

const MLTTBlockModal = () => {
  return (
    <>
      <h2>{'Out of free MLTT withdrawals!'}</h2>
      <p>
        {
          "Sorry, we've run out of free MLTT withdrawals :( But don't worry, you will be able to withdraw your MLTT nonetheless! We are soon adding an option to pay for your withdrawal with a different token."
        }
      </p>
      <p>
        {
          'To test withdrawals today, try depositing some other tokens, or just go to our '
        }
        <a href='//testnet.zksync.io' target='_blank' rel='noopener noreferrer'>
          {'testnet on Rinkeby'}
        </a>
      </p>
    </>
  );
};

const ExternalWalletLogin = observer(() => {
  const store = useStore();
  const { createWallet } = useWalletInit();
  const logout = useLogout();
  const [conditionError, setConditionError] = useState(false);

  const mainBtnCb = () => {
    if (!store.externalWalletInitializing) {
      store.externalWalletInitializing = true;
      createWallet();
    } else {
      logout(false, '');
    }
  };

  const isAddressValid = ADDRESS_VALIDATION['eth'].test(
    store.externalWalletAddress,
  );
  const connectBtnDisabled = conditionError || !store.externalWalletAddress;

  useEffect(() => {
    setConditionError(false);
  }, [store.externalWalletAddress]);

  return (
    <>
      <h3 className='title-connecting'>{'External wallet'}</h3>
      {store.externalWalletInitializing ? (
        <Spinner />
      ) : (
        <>
          <span className='transaction-field-title plain'>{'Address:'}</span>
          <input
            onChange={e => (store.externalWalletAddress = e.target.value)}
            type='text'
            placeholder='0x address'
            className='external-address'
          />
        </>
      )}
      <div className='error-container'>
        <p className={`error-text ${conditionError && 'visible'}`}>
          {`Error: "${store.externalWalletAddress}" doesn't match ethereum address format`}
        </p>
      </div>
      <button
        className={`btn submit-button margin ${connectBtnDisabled &&
          'disabled'}`}
        onClick={() => (isAddressValid ? mainBtnCb() : setConditionError(true))}
      >
        {store.externalWalletInitializing ? 'Cancel' : 'Connect'}
      </button>
    </>
  );
});

export const HintBody: React.FC = observer(
  (): JSX.Element => {
    const { modalHintMessage } = useStore();
    return (
      <div className='hint-body'>
        {modalHintMessage === 'myWallet' && <MyWallet />}
        {modalHintMessage === 'BalancesInL2' && <BalancesInL2 />}
        {modalHintMessage === 'ERC20UnlockHint' && <ERC20UnlockHint />}
        {modalHintMessage === 'ERC20UnlockHintUnlocked' && (
          <ERC20UnlockHintUnlocked />
        )}
        {modalHintMessage === 'OtherWallets' && <OtherWallets />}
        {modalHintMessage === 'DoNoTSendToExchanges' && (
          <DoNoTSendToExchanges />
        )}
        {modalHintMessage === 'walletConnectLater' && <WalletConnectLater />}
        {(modalHintMessage === 'makeTwitToWithdraw' ||
          modalHintMessage === 'makeTwitToClaim') && <MakeTwitToWithdraw />}
        {modalHintMessage === 'TroubleSeeingAToken' && <TroubleSeeingAToken />}
        {modalHintMessage === 'MLTTBlockModal' && <MLTTBlockModal />}
        {modalHintMessage === 'MLTTonMainnet' && <MLTTonMainnet />}
        {modalHintMessage === 'UnlinkCoinBase' && <UnlinkCoinBase />}
        {modalHintMessage === 'ExternalWalletLogin' && <ExternalWalletLogin />}
      </div>
    );
  },
);

export default HintBody;
