# react-loggly-jslogger

Wrapper of [loggly-jslogger](https://www.npmjs.com/package/loggly-jslogger) for use in React apps.

Provides a `LogglyTracker` instance with helper functions for logging various levels of messages.

Data provider callbacks can be used to append properties to the data sent to Loggly as new information becomes available (e.g. authenticated user information).

## Installation

Install the package using NPM or Yarn:

        npm install --save react-loggly-jslogger
        # or
        # yarn add react-loggly-jslogger

Add your Loggly token and any environment-specific tags to `./.env`:

        REACT_APP_LOGGLY_CUSTOMER_TOKEN=<token>
        REACT_APP_LOGGLY_TAG=mytagone,mytagtwo

## Usage

### `LogglyProvider` Component

    import React from 'react';
    import { LogglyProvider } from 'react-loggly-jslogger';

    // Custom LogglyTracker initialization options
    // Sensible React defaults (including your customer token) are automatically applied
    const options = {};

    // Custom data can be appended using provider callbacks
    // Additional providers can be added later down the component tree (see examples below)
    const providers = {

      // Custom "foo" data added to error messages only
      foo: (instance, key, level, data) => {
        if ('error' === level) {
          return {
            [key]: 'bar',
          };
        }
      },

    };

    const App = (props) => (
      <LogglyProvider options={options} providers={providers}>
        ...
      </LogglyProvider>
    );

    export default App;

### `useLoggly` Hook

    import React from 'react';
    import { useLoggly } from 'react-loggly-jslogger';
    import { useUser } from 'some-authed-user-provider';

    const AccountDashboard = (props) => {

      const { error, providers } = useLoggly();
      const { user } = useUser();

      // Append authenticated user information to logged messages
      providers.user = (instance, key, level, data) => ({
        [key]: user.id,
      )},

      try {
        somethingThatBangs();
      } catch (err) {
        error(err);
      }

      return (
        <>
          ...
        </>
      );

    };

    export default AccountDashboard;

### `withLoggly` High-Order Component

    import React, { Component } from 'react';
    import { withLoggly } from 'react-loggly-jslogger';
    import { withUser } from 'some-authed-user-provider';

    class AccountDashboard extends Component {

      render() {

        const { loggly: { error, providers }, user } = this.props;

        // Append authenticated user information to logged messages
        providers.user = (instance, key, level, data) => ({
          [key]: user.id,
        )},

        try {
          somethingThatBangs();
        } catch (err) {
          error(err);
        }

        return (
          <>
            ...
          </>
        );

      }

    }

    export default withLoggly(withUser(AccountDashboard));
