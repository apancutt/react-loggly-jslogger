# react-loggly-jslogger

React providers for [loggly-jslogger](https://www.npmjs.com/package/loggly-jslogger) using the [Context API](https://reactjs.org/docs/context.html).

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

3. Import `loggly` directly or via context using either the `useContext()` hook (stateless components only) or the `withLoggly()` High-Order Component. The value provided will be either an instance of [LogglyTracker](https://www.loggly.com/docs/javascript/) or `null` if a token was not provided; useful for untracked environments.

## Examples

### Usage with `import` ###

    import React, { useContext } from 'react';
    import { errorFormatter, loggly } from 'react-loggly-jslogger';

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

### Usage with `useContext()` Hook ###

    import React, { useContext } from 'react';
    import { logglyContext} from 'react-loggly-jslogger';

    const App = (props) = {

      const { errorFormatter, loggly } = useContext(logglyContext);

      // Note that loggly will be null if a token has not been configured

      try {
        throw new Error('Bang!');
      } catch (err) {
        loggly && loggly.push(errorFormatter(err));
      }

      return <div>The error was sent to Loggly</div>;

    };

    export default App;

### Usage with `withLoggly()` High-Order Component

    import React from 'react';
    import { withLoggly } from 'react-loggly-jslogger';

    class App extends Component {

      render() {

        const { errorFormatter, loggly } = this.props;

        // Note that loggly will be null if a token has not been configured

        try {
          throw new Error('Bang!');
        } catch (err) {
          loggly && loggly.push(errorFormatter(err));
        }

        return <div>The error was sent to Loggly</div>;

      }

    }

    export default withLoggly(App);
