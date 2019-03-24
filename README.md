# react-loggly-jslogger

Thin wrapper for [loggly-jslogger](https://www.npmjs.com/package/loggly-jslogger) for use in React apps.

## Installation

1. Install the package using NPM or Yarn:

        npm install --save react-loggly-jslogger
        # or
        # yarn add react-loggly-jslogger

## Usage

1. Add your Loggly token and any common tags to `./.env`:

        REACT_APP_LOGGLY_CUSTOMER_TOKEN=<token>
        REACT_APP_LOGGLY_TAG=mytagone,mytagtwo

2. Intialize Loggly with any custom configuration in `./src/index.jsx`:

        import React from 'react';
        import ReactDOM from 'react-dom';
        import { init as initLoggly } from 'react-loggly-jslogger';
        import App from './App';

        initLoggly({/* custom configuration */});

        ReactDOM.render(<App />, document.getElementById('root'));

3. Import the instance into your components where required:

        import React from 'react';
        import loggly, { errorFormatter } from 'react-loggly-jslogger';

        const App = (props) = {

          // Note that loggly will be null if a token has not been configured

          try {
            throw new Error('Bang!');
          } catch (err) {
            loggly && loggly.push(errorFormatter(err));
          }

          return <div>The error was sent to Loggly</div>;

        };

        export default App;
