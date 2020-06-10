import React, { createContext, useContext, useMemo, useCallback, useEffect } from 'react';
import { LogglyTracker } from 'loggly-jslogger';

function _extends() {
  _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  return _extends.apply(this, arguments);
}

const context = createContext({
  error: (err, data = {}, once = false) => {},
  info: (data, once = false) => {},
  instance: null,
  providers: {},
  warn: (data, once = false) => {}
});
const Consumer = context.Consumer;
const Provider = context.Provider;
const useLoggly = () => useContext(context);
const withLoggly = Component => props => /*#__PURE__*/React.createElement(Consumer, null, loggly => /*#__PURE__*/React.createElement(Component, _extends({
  loggly: loggly
}, props)));

let previous;
const instance = new LogglyTracker();

const logFn = (level, data, providers, once = false) => {
  if (!instance.key) {
    return;
  }

  if ('object' !== typeof data) {
    data = {
      data: JSON.stringify(data)
    };
  }

  Object.entries(providers).forEach(([key, callback]) => {
    data = { ...data,
      ...callback(instance, key, level, data)
    };
  });

  if (!once || !previous || previous.data.column !== data.column || previous.data.file !== data.file || previous.data.line !== data.line || previous.data.message !== data.message || previous.level !== level) {
    instance.track({ ...data,
      level
    });
  }

  previous = {
    data,
    level
  };
};

const LogglyProvider = ({
  children,
  options,
  providers
}) => {
  options = useMemo(() => ({
    logglyKey: process.env.REACT_APP_LOGGLY_CUSTOMER_TOKEN,
    sendConsoleErrors: true,
    tag: process.env.REACT_APP_LOGGLY_TAG,
    useUtfEncoding: true,
    ...options
  }), [options]);
  providers = useMemo(() => ({ ...providers,
    url: (instance, key, level, data) => ({
      [key]: window.location.href
    }),
    userAgent: (instance, key, level, data) => ({
      [key]: window.navigator.userAgent
    })
  }), [providers]);
  const info = useCallback((data, once = false) => {
    logFn('info', data, providers, once);
  }, [providers]);
  const warn = useCallback((data, once = false) => {
    logFn('warn', data, providers, once);
  }, [providers]);
  const error = useCallback((err, data = {}, once = false) => {
    logFn('error', { ...data,
      file: err.fileName || err.filename,
      line: err.lineNumber || err.lineno,
      column: err.colno,
      message: err.message,
      stack: err.stack || (err.error ? err.error.stack : undefined)
    }, providers, once);
  }, [providers]);
  const globalErrorHandler = useCallback(err => error(err, undefined, true), [error]);
  useEffect(() => {
    instance.push({ ...options,
      sendConsoleErrors: false
    });

    if (!options.sendConsoleErrors) {
      return;
    } // Use our own global error handler to ensure errors are always reported with the same structure
    // and repeated errors are only reported once


    window.addEventListener('error', globalErrorHandler);
    return () => {
      window.removeEventListener('error', globalErrorHandler);
    };
  }, [globalErrorHandler, options]);
  return /*#__PURE__*/React.createElement(Provider, {
    value: {
      error,
      info,
      instance,
      providers,
      warn
    }
  }, children);
};

export { LogglyProvider, useLoggly, withLoggly };
