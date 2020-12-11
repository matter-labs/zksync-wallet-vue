import { types as SyncTypes } from 'zksync';

// The class is private in zkSync and we've got
// no choice but to copy-paste it
export class ZKSyncTxError extends Error {
  constructor(
    message: string,
    public value:
    | SyncTypes.PriorityOperationReceipt
    | SyncTypes.TransactionReceipt,
  ) {
    super(message);
  }
}
