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

const defaults = {
  logglyKey: process.env.REACT_APP_LOGGLY_CUSTOMER_TOKEN,
  sendConsoleErrors: true,
  tag: process.env.REACT_APP_LOGGLY_TAG,
  useUtfEncoding: true
};

const log = (instance, level, data, providers) => {
  if (!instance.key) {
    return;
  }

  if ('object' !== typeof data) {
    data = {
      data: JSON.stringify(data)
    };
  }

  data = Object.assign({}, data);
  Object.keys(providers || {}).forEach(key => Object.assign(data, providers[key](instance, key, level, data) || {}));
  instance.track({ ...data,
    level
  });
};

const LogglyProvider = ({
  children,
  options,
  providers
}) => {
  const instance = new logglyJslogger.LogglyTracker();
  providers = providers || {};

  providers.url = (instance, key, level, data) => ({
    [key]: window.location.href
  });

  providers.userAgent = (instance, key, level, data) => ({
    [key]: window.navigator.userAgent
  });

  const info = data => {
    log(instance, 'info', data, providers);
  };

  const warn = data => {
    log(instance, 'warn', data, providers);
  };

  const error = (err, data = {}) => {
    log(instance, 'error', { ...data,
      file: err.fileName || err.filename,
      line: err.lineNumber || err.lineno,
      column: err.colno,
      message: err.message,
      stack: err.stack || (err.error ? err.error.stack : undefined)
    }, providers);
  };

  options = Object.assign({}, defaults, options); // Use our own implementation to ensure all errors are reported in the same format

  if (options.sendConsoleErrors) {
    options.sendConsoleErrors = false;
    window.addEventListener('error', error);
  }

  instance.push(options);
  return React__default.createElement(Provider, {
    value: {
      error,
      info,
      instance,
      providers,
      warn
    }
  }, children);
};

exports.LogglyProvider = LogglyProvider;
exports.useLoggly = useLoggly;
exports.withLoggly = withLoggly;
