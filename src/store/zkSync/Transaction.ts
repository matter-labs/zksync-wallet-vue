import { Provider, types as SyncTypes } from 'zksync';
import { ZKSyncTxError } from './ZKSyncTxError';

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

  async awaitReceipt(): Promise<SyncTypes.TransactionReceipt|null> {
    this.throwErrorIfFailedState();

    // Got absolutely no idea how it compiled in zksync.js
    /*  eslint-disabled:@typescript-eslint/ban-ts-comment */
    /* @ts-ignore */
    if (this.state !== 'Sent') return;

    const receipt = await this.sidechainProvider.notifyTransaction(
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
