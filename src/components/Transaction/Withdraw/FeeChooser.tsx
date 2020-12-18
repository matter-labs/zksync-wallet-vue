import React from 'react';
import { observer } from 'mobx-react-lite';
import { useStore } from 'src/store/context';
import { ADDRESS_VALIDATION } from 'constants/regExs';
import { handleFormatToken } from 'src/utils';
import {
  handleInputWidth,
  timeCalc,
  timeStempString,
  validateNumbers
} from 'components/Transaction/TransactionFunctions';
import { Wallet } from 'zksync';
import { RadioButton } from 'components/Common/RadioButton';

interface IFeeChooserProps {
  title: string;
  myRef: any;
}

export const FeeChooser: React.FC<IFeeChooserProps> = observer(
        ({ title, myRef }): JSX.Element => {
          if (title !== 'Withdraw') {
            return (<></>);
          }
          const store = useStore();
          const { TransactionStore, zkWallet } = store;

          const feeToken = TransactionStore.getFeeToken();
          const withdrawToken = TransactionStore.symbolName;
          const fastFeeDisabled = feeToken !== withdrawToken;
          /**
           * stop processing in case any part is missing
           */
          if (!TransactionStore.symbolName || !TransactionStore.amount || !ADDRESS_VALIDATION['eth'].test(TransactionStore.recepientAddress) || !zkWallet) {
            return (<></>);
          }
          const exceedBalanceTrigger = feeArg => {
            return (
                    +TransactionStore.amountShowedValue +
                    +handleFormatToken(zkWallet as Wallet, TransactionStore.symbolName, feeArg) >=
                    +TransactionStore.maxValue
            );
          };

          const valueHandler = () => {
            const maxValueInSelected =
                    +TransactionStore.pureAmountInputValue +
                    +handleFormatToken(zkWallet as Wallet, TransactionStore.symbolName, TransactionStore.fee[TransactionStore.symbolName]) >=
                    +TransactionStore.maxValue;

            if (TransactionStore.fastWithdrawal && maxValueInSelected) {
              return (
                      +TransactionStore.pureAmountInputValue -
                      +handleFormatToken(zkWallet as Wallet, TransactionStore.symbolName, TransactionStore.fastFee)
              );
            }
            if (!TransactionStore.fastWithdrawal && maxValueInSelected) {
              return (
                      +TransactionStore.pureAmountInputValue -
                      +handleFormatToken(zkWallet as Wallet, TransactionStore.symbolName, TransactionStore.fee[TransactionStore.symbolName])
              );
            } else {
              return +TransactionStore.pureAmountInputValue;
            }
          };

          const radioButtonCb = fee => {
            TransactionStore.fastWithdrawal = !TransactionStore.fastWithdrawal;
            if (!TransactionStore.amountShowedValue) return (<></>);
            if (exceedBalanceTrigger(fee)) {
              return (TransactionStore.conditionError = 'Not enough funds: amount + fee exceeds your balance');
            }
            TransactionStore.amountValue = valueHandler();
            validateNumbers(store, valueHandler()?.toString(), title).then(function () {
              TransactionStore.amount = (valueHandler() as number);
              handleInputWidth(TransactionStore, myRef, valueHandler() as number);
              TransactionStore.conditionError = '';
              TransactionStore.pureAmountInputValue = valueHandler()?.toString();
            });
          };

          return (
                  <>
                    {(<div className='withdraw-type-block' onClick={() => {
                      radioButtonCb(TransactionStore.fee[feeToken as string]);
                    }}>
                      <RadioButton selected={!TransactionStore.fastWithdrawal || fastFeeDisabled}/>
                      <p className='checkbox-text'>{`Normal (fee ${TransactionStore.fee[feeToken as string] &&
                      handleFormatToken(zkWallet as Wallet, feeToken as string, TransactionStore.fee[feeToken as string],)}
              ${feeToken}), processing time ${timeStempString(timeCalc(TransactionStore.withdrawalProcessingTime))}`}</p>
                    </div>)}
                    {((fastFeeDisabled) || (<div className='withdraw-type-block' onClick={
                      () => {radioButtonCb(TransactionStore.fastFee);}
                    }>
                      <RadioButton
                          selected={TransactionStore.fastWithdrawal}
                      />
                      <p className='checkbox-text'>{`Fast (fee ${+TransactionStore.fastFee &&
                      handleFormatToken(zkWallet as Wallet, feeToken as string, TransactionStore.fastFee)} ${feeToken}), processing time ${timeStempString(timeCalc(TransactionStore.fastWithdrawalProcessingTime))}`}</p>
                    </div>))}
                  </>
          );
        }
);
