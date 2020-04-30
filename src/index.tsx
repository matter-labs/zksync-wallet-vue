import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom';

import Account from './pages/Account';
import App from './App';
import Contacts from './pages/Contacts';
import PrimaryPage from './pages/PrimaryPage';
import Transactions from './pages/Transactions';

import StoreProvider from './store/context';

import './index.scss';

import * as serviceWorker from './serviceWorker';

ReactDOM.render(
  <StoreProvider>
    <BrowserRouter>
      <App>
        <Switch>
          <Route path='/account' exact component={Account} />
          <Route path='/contacts' exact component={Contacts} />
          <Route path='/transactions' exact component={Transactions} />
          <Route path='/' exact component={PrimaryPage} />
          <Route path='/' render={() => <Redirect to='/' />} />
        </Switch>
      </App>
    </BrowserRouter>
  </StoreProvider>,
  document.getElementById('root'),
);
serviceWorker.unregister();
