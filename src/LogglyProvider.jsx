import { LogglyTracker } from 'loggly-jslogger';
import React from 'react';
import { Provider } from './contexts/loggly';

const defaults = {
  logglyKey: process.env.REACT_APP_LOGGLY_CUSTOMER_TOKEN,
  sendConsoleErrors: true,
  tag: process.env.REACT_APP_LOGGLY_TAG,
  useUtfEncoding: true,
};

const log = (instance, level, data, providers) => {

  if (!instance.key) {
    return;
  }

  if ('object' !== typeof data) {
    data = {
      data: JSON.stringify(data),
    };
  }

  data = Object.assign({}, data);

  Object.keys(providers || {}).forEach((key) => Object.assign(data, providers[key](instance, key, level, data) || {}));

  instance.track({
    ...data,
    level,
  });

};

const LogglyProvider = ({ children, options, providers }) => {

  const instance = new LogglyTracker();

  providers = providers || {};
  providers.url = (instance, key, level, data) => ({ [key]: window.location.href });
  providers.userAgent = (instance, key, level, data) => ({ [key]: window.navigator.userAgent });

  const info = (data) => {
    log(instance, 'info', data, providers);
  };

  const warn = (data) => {
    log(instance, 'warn', data, providers);
  };

  const error = (err, data = {}) => {
    log(instance, 'error', {
      ...data,
      file: err.fileName || err.filename,
      line: err.lineNumber || err.lineno,
      column: err.colno,
      message: err.message,
      stack: err.stack || (err.error ? err.error.stack : undefined),
    }, providers);
  };

  options = Object.assign({}, defaults, options);

  // Use our own implementation to ensure all errors are reported in the same format
  if (options.sendConsoleErrors) {
    options.sendConsoleErrors = false;
    window.addEventListener('error', error);
  }

  instance.push(options);

  return (
    <Provider value={{ error, info, instance, providers, warn }}>
      {children}
    </Provider>
  );

};

export default LogglyProvider;
