import { ContractTransaction } from 'ethers';
import { IEthBalance } from '../../types/Common';

export interface ITransactionProps {
  addressValue: string;
  amountValue?: number;
  balances?: IEthBalance[];
  hash: ContractTransaction | string | undefined;
  isExecuted: boolean;
  isInput: boolean;
  onChangeAddress: (e: string) => void;
  price: any;
  propsMaxValue?: number;
  propsSymbolName?: string;
  propsToken?: string;
  setHash: React.Dispatch<
    React.SetStateAction<string | ContractTransaction | undefined>
  >;
  setTransactionType: (
    transaction: 'deposit' | 'withdraw' | 'transfer' | undefined,
  ) => void;
  setExecuted: React.Dispatch<React.SetStateAction<boolean>>;
  setSymbol: React.Dispatch<React.SetStateAction<string>>;
  title: string;
  transactionAction: (address?: any, type?: any, symbol?: any) => Promise<void>;
  type?: string;
}
