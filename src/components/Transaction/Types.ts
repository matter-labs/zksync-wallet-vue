import { ContractTransaction } from 'ethers';

export interface ITransactionProps {
  addressValue: string;
  amountValue?: number;
  asset: string;
  balance: number;
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
  transactionAction: () => void;
}
