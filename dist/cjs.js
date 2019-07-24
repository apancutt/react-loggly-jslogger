'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var React = require('react');
var React__default = _interopDefault(React);
var logglyJslogger = require('loggly-jslogger');

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

const context = React.createContext({
  error: (err, data = {}) => {},
  info: data => {},
  instance: null,
  providers: {},
  warn: data => {}
});
const Consumer = context.Consumer;
const Provider = context.Provider;
const useLoggly = () => React.useContext(context);
const withLoggly = Component => props => React__default.createElement(Consumer, null, loggly => React__default.createElement(Component, _extends({
  loggly: loggly
}, props)));

let previous;

const logFn = (instance, level, data, providers, once = false) => {
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
  options = React.useMemo(() => ({
    logglyKey: process.env.REACT_APP_LOGGLY_CUSTOMER_TOKEN,
    sendConsoleErrors: true,
    tag: process.env.REACT_APP_LOGGLY_TAG,
    useUtfEncoding: true,
    ...options
  }), [options]);
  providers = React.useMemo(() => ({ ...providers,
    url: (instance, key, level, data) => ({
      [key]: window.location.href
    }),
    userAgent: (instance, key, level, data) => ({
      [key]: window.navigator.userAgent
    })
  }), [providers]);
  const instance = React.useRef(null);
  const info = React.useCallback((data, once = false) => {
    if (instance.current) {
      logFn(instance.current, 'info', data, providers, once);
    }
  }, [providers]);
  const warn = React.useCallback((data, once = false) => {
    if (instance.current) {
      logFn(instance.current, 'warn', data, providers, once);
    }
  }, [providers]);
  const error = React.useCallback((err, data = {}, once = false) => {
    if (instance.current) {
      logFn(instance, 'error', { ...data,
        file: err.fileName || err.filename,
        line: err.lineNumber || err.lineno,
        column: err.colno,
        message: err.message,
        stack: err.stack || (err.error ? err.error.stack : undefined)
      }, providers, once);
    }
  }, [providers]);
  const globalErrorHandler = React.useCallback(err => error(err, undefined, true), [error]);
  React.useEffect(() => {
    instance.current = new logglyJslogger.LogglyTracker();
    instance.current.push({ ...options,
      sendConsoleErrors: false
    }); // Use our own global error handler to ensure errors are always reported with the same structure
    // and repeated errors are only reported once

    if (options.sendConsoleErrors) {
      window.addEventListener('error', globalErrorHandler);
    }

    return () => {
      instance.current = null;

      if (options.sendConsoleErrors) {
        window.removeEventListener('error', globalErrorHandler);
      }
    };
  }, [globalErrorHandler, options]);
  return React__default.createElement(Provider, {
    value: {
      error,
      info,
      providers,
      warn,
      instance: instance.current
    }
  }, children);
};

exports.LogglyProvider = LogglyProvider;
exports.useLoggly = useLoggly;
exports.withLoggly = withLoggly;
