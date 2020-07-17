import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import 'mobx-react-lite/optimizeForReactDom';
import Bugsnag from '@bugsnag/js';
import BugsnagPluginReact from '@bugsnag/plugin-react';

import Account from './pages/Account';
import App from './App';
import Contacts from './pages/Contacts';
import PrimaryPage from './pages/PrimaryPage';
import Transactions from './pages/Transactions';
import { Deposit } from './pages/Deposit';
import { Send } from './pages/Send';
import { Withdraw } from './pages/Withdraw';
import { TokenPage } from './pages/TokenPage';
import { ContactPage } from './pages/ContactPage';
import StoreProvider, { useStore } from './store/context';
import * as serviceWorker from './serviceWorker';

import { BUGSNAG_APIKEY } from 'constants/common';

import './index.scss';

Bugsnag.start({
  apiKey: BUGSNAG_APIKEY,
  plugins: [new BugsnagPluginReact()],
  releaseStage: process.env.NODE_ENV,
});

const ErrorBoundary = Bugsnag.getPlugin('react')!.createErrorBoundary(React);

const Index = observer(() => {
  const store = useStore();

  return (
    <BrowserRouter>
      <App>
        <Switch>
          {!!store.propsSymbolName && (
            <Route
              path={`/account/${store.propsSymbolName &&
                store.propsSymbolName.toLowerCase()}`}
              exact
              component={TokenPage}
            />
          )}
          {!!store.walletAddress.address && (
            <Route
              path={`/contacts/${store.walletAddress.address?.toLowerCase()}`}
              exact
              component={ContactPage}
            />
          )}
          <Route path='/account' exact component={Account} />
          <Route path='/contacts' exact component={Contacts} />
          <Route path='/transactions' exact component={Transactions} />
          <Route path='/deposit' exact component={Deposit} />
          <Route path='/transfer' exact component={Send} />
          <Route path='/withdraw' exact component={Withdraw} />
          <Route path='/' exact component={PrimaryPage} />
          <Route path='/' render={() => <Redirect to='/' />} />
        </Switch>
      </App>
    </BrowserRouter>
  );
});

ReactDOM.render(
  <ErrorBoundary>
    <StoreProvider>
      <Index />
    </StoreProvider>
  </ErrorBoundary>,
  document.getElementById('root'),
);
serviceWorker.unregister();
