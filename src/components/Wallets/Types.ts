import { IEthBalance } from '../../types/Common';

export interface IMyWalletProps {
  balances: IEthBalance[];
  price: number;
  setTransactionType: (transaction: 'deposit' | 'withdraw' | 'transfer' | undefined) => void;
  title: string;
}
