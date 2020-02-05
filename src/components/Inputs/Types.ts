import { ContractTransaction } from 'ethers';
import { IEthBalance } from '../../types/Common';

export interface ITransactionProps {
  balances?: IEthBalance[];
}
