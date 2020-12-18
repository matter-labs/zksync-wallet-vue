import { ContractTransaction } from 'ethers';
import { IEthBalance } from 'types/Common';

export interface ITransactionProps {
  amountValue?: number;
  balances?: IEthBalance[];
  isInput: boolean;
  price: any;
  propsMaxValue?: number;
  propsSymbolName?: string;
  propsToken?: string;
  setTransactionType: (
    transaction: 'deposit' | 'withdraw' | 'transfer' | undefined,
  ) => void;
  title: string;
  transactionAction: (address?: any, type?: any, symbol?: any) => Promise<void>;
  type?: string;
}
