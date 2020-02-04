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
  onCancel?: (setModal: (isOpen: boolean) => void) => void;
  openModal?: (isOpen: boolean) => void;
  onChangeAddress: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onChangeAmount: React.Dispatch<React.SetStateAction<number | undefined>>;
  setExecuted: React.Dispatch<React.SetStateAction<boolean>>;
  title: string;
  transactionAction: (token?: string, type?: string) => void;
  type: string;
}
