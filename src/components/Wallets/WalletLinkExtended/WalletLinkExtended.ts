import { EventEmitter } from 'events';

export interface AbstractConnectorArguments {
  supportedChainIds?: number[];
}

export interface ConnectorUpdate<T = number | string> {
  provider?: any;
  chainId?: T;
  account?: null | string;
}

export enum ConnectorEvent {
  Update = 'Web3ReactUpdate',
  Error = 'Web3ReactError',
  Deactivate = 'Web3ReactDeactivate',
}

export abstract class AbstractConnector extends EventEmitter {
  public readonly supportedChainIds?: number[];

  constructor({ supportedChainIds }: AbstractConnectorArguments = {}) {
    super();
    this.supportedChainIds = supportedChainIds;
  }

  public abstract async activate(): Promise<ConnectorUpdate>;
  public abstract async getProvider(): Promise<any>;
  public abstract getChainId(): number | string;
  public abstract async getAccount(): Promise<null | string>;
  public abstract deactivate(): void;

  protected emitUpdate(update: ConnectorUpdate): void {
    this.emit(ConnectorEvent.Update, update);
  }

  protected emitError(error: Error): void {
    this.emit(ConnectorEvent.Error, error);
  }

  protected emitDeactivate(): void {
    this.emit(ConnectorEvent.Deactivate);
  }
}

interface WalletLinkConnectorArguments {
  url: string;
  appName: string;
  chainId: number;
  appLogoUrl?: string;
  darkMode?: boolean;
}

export class WalletLinkConnector extends AbstractConnector {
  private readonly url: string;
  private readonly appName: string;
  private readonly appLogoUrl?: string;
  private readonly darkMode: boolean;
  private readonly chainId: number;

  public walletLink: any;
  private provider: any;

  constructor({
    url,
    appName,
    chainId,
    appLogoUrl,
    darkMode,
  }: WalletLinkConnectorArguments) {
    super({ supportedChainIds: [chainId] });

    this.url = url;
    this.appName = appName;
    this.appLogoUrl = appLogoUrl;
    this.darkMode = darkMode || false;
    this.chainId = chainId;
  }

  public async activate(): Promise<ConnectorUpdate> {
    if (!this.walletLink) {
      const { default: WalletLink } = await import('walletlink');
      this.walletLink = new WalletLink({
        appName: this.appName,
        darkMode: this.darkMode,
        ...({ appLogoUrl: this.appLogoUrl } ?? {}),
      });
      this.provider = this.walletLink.makeWeb3Provider(this.url, this.chainId);
    }
    const account = await this.provider
      .send('eth_requestAccounts')
      .then((accounts: string[]): string => accounts[0])
      .catch(() => window.location.reload());

    return { provider: this.provider, chainId: this.chainId, account: account };
  }

  public async getProvider(): Promise<any> {
    return this.provider;
  }

  public getChainId(): number {
    return this.chainId;
  }

  public async getAccount(): Promise<null | string> {
    return this.provider.send('eth_accounts').then((accounts: string[]): string => accounts[0]);
  }

  public async close() {
    this.provider.close();
    this.emitDeactivate();
  }

  public deactivate() {
    this.close();
  }
}
