import { IEthBalance } from 'types/Common';

export interface IMyWalletProps {
  balances: IEthBalance[];
  price: any;
  setTransactionType: (
    transaction: 'deposit' | 'withdraw' | 'transfer' | undefined,
  ) => void;
  title: string;
}
