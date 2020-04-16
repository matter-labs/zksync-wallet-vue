import { Tx } from './pages/Transactions';
import { getConfirmationCount } from './utils';
import { Web3Provider } from 'ethers/providers';

export async function fetchTransactions(
  amount: number,
  offset: number,
  address: string,
  web3Provider?: Web3Provider,
) {
  const txs: Tx[] = await fetch(
    `https://testnet.zksync.dev/api/v0.1/account/${address}/history/${offset}/${amount}`,
  ).then(r => r.json());

  return await Promise.all(
    txs.map(async tx =>
      Object.assign(tx, {
        confirmCount: web3Provider
          ? await getConfirmationCount(web3Provider!, tx.hash)
          : 0,
      }),
    ),
  );
}
