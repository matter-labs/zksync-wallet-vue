import React from 'react';
import { useStore } from 'src/store/context';
import { timeCalc, timeStempString } from 'components/Transaction/TransactionFunctions';

type Props = {
  title: string;
}

export default function TimeNotice ({ title }: Props) {
  const { TransactionStore } = useStore();

  if (title !== 'Withdraw' || (!TransactionStore.fastWithdrawal && !TransactionStore.withdrawalProcessingTime))
  {
    return (<></>);
  }
  const timeToCalculate = TransactionStore.fastWithdrawal ? TransactionStore.fastWithdrawalProcessingTime : TransactionStore.withdrawalProcessingTime;
  return (
    <p className='withdraw-hint'>
        {`Your withdrawal should take max. ${timeStempString(timeCalc(timeToCalculate))}.`}
    </p>
  );
}
