import React from 'react';
import LogglyContext from './context'

const withLoggly = (Component) => (props) => (
  <LogglyContext.Consumer>
    {({ errorFormatter, loggly }) => (
      <Component loggly={loggly} errorFormatter={errorFormatter} {...props} />
    )}
  </LogglyContext.Consumer>
);

export default withLoggly;
