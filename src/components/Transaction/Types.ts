import { ContractTransaction } from 'ethers';
import { IEthBalance } from '../../types/Common';

export interface ITransactionProps {
  addressValue: string;
  amountValue?: number;
  balances?: IEthBalance[];
  hash: ContractTransaction | string | undefined;
  isExecuted: boolean;
  isInput: boolean;
  isLoading: boolean;
  onChangeAddress: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onChangeAmount: React.Dispatch<React.SetStateAction<number | undefined>>;
  setHash: React.Dispatch<React.SetStateAction<string | ContractTransaction | undefined>>;
  setExecuted: React.Dispatch<React.SetStateAction<boolean>>;
  price: number;
  title: string;
  transactionAction: (token?: any, type?: any) => Promise<void>;
  type?: string;
}
