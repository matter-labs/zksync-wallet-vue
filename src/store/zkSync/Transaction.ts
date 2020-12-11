import { Provider, types as SyncTypes } from 'zksync';
import { ZKSyncTxError } from 'src/store/zkSync/ZKSyncTxError';

// The class is private in zkSync and we've got
// no choice but to copy-paste it
export class Transaction {
  state: 'Sent' | 'Committed' | 'Verified' | 'Failed';
  error?: ZKSyncTxError;

  constructor(
    public txData: any,
    public txHash: string,
    public sidechainProvider: Provider,
  ) {
    this.state = 'Sent';
  }

  /**
   * async method with LOOOONG timeout.
   */
  async awaitReceipt(): Promise<SyncTypes.TransactionReceipt|null> {
    this.throwErrorIfFailedState();

    if (this.state !== 'Sent') return null;

    const receipt:SyncTypes.TransactionReceipt = await this.sidechainProvider.notifyTransaction(
      this.txHash,
      'COMMIT',
    );

    if (!receipt.success) {
      this.setErrorState(
        new ZKSyncTxError(
          `zkSync transaction failed: ${receipt.failReason}`,
          receipt,
        ),
      );
      this.throwErrorIfFailedState();
    }

    this.state = 'Committed';
    return receipt;
  }

  async awaitVerifyReceipt(): Promise<SyncTypes.TransactionReceipt> {
    await this.awaitReceipt();
    const receipt = await this.sidechainProvider.notifyTransaction(
      this.txHash,
      'VERIFY',
    );

    this.state = 'Verified';
    return receipt;
  }

  private setErrorState(error: ZKSyncTxError) {
    this.state = 'Failed';
    this.error = error;
  }

  private throwErrorIfFailedState() {
    if (this.state === 'Failed') throw this.error;
  }
}
