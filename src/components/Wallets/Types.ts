import { IEthBalance } from '../../types/Common';

export interface IMyWalletProps {
  balances: IEthBalance[];
  price: number;
  setTransactionType: React.Dispatch<React.SetStateAction<'deposit' | 'withdraw' | 'transfer' | undefined>>;
  title: string;
}
