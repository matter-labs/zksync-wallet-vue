import { IEthBalance } from '../../types/Common';

export interface IMyWalletProps {
  balances: IEthBalance[];
  price: number;
  title: string;
}
