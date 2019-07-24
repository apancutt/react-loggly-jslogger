import { LogglyTracker } from 'loggly-jslogger';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { Provider } from './contexts/loggly';

let previous;

const logFn = (instance, level, data, providers, once = false) => {

  if (!instance.key) {
    return;
  }

  if ('object' !== typeof data) {
    data = { data: JSON.stringify(data) };
  }

  Object.entries(providers).forEach(([ key, callback ]) => {
    data = {
      ...data,
      ...callback(instance, key, level, data),
    };
  });

  if (
    !once
    || !previous
    || previous.data.column !== data.column
    || previous.data.file !== data.file
    || previous.data.line !== data.line
    || previous.data.message !== data.message
    || previous.level !== level
  ) {
    instance.track({ ...data, level });
  }

  previous = { data, level };

};

const LogglyProvider = ({ children, options, providers }) => {

  options = useMemo(() => ({
    logglyKey: process.env.REACT_APP_LOGGLY_CUSTOMER_TOKEN,
    sendConsoleErrors: true,
    tag: process.env.REACT_APP_LOGGLY_TAG,
    useUtfEncoding: true,
    ...options,
  }), [ options ]);

  providers = useMemo(() => ({
    ...providers,
    url: (instance, key, level, data) => ({ [key]: window.location.href }),
    userAgent: (instance, key, level, data) => ({ [key]: window.navigator.userAgent }),
  }), [ providers ]);

  const instance = useRef(null);

  const info = useCallback((data, once = false) => {
    if (instance.current) {
      logFn(instance.current, 'info', data, providers, once);
    }
  }, [ providers ]);

  const warn = useCallback((data, once = false) => {
    if (instance.current) {
      logFn(instance.current, 'warn', data, providers, once);
    }
  }, [ providers ]);

  const error = useCallback((err, data = {}, once = false) => {
    if (instance.current) {
      logFn(instance, 'error', {
        ...data,
        file: err.fileName || err.filename,
        line: err.lineNumber || err.lineno,
        column: err.colno,
        message: err.message,
        stack: err.stack || (err.error ? err.error.stack : undefined),
      }, providers, once);
    }
  }, [ providers ]);

  const globalErrorHandler = useCallback((err) => error(err, undefined, true), [ error ]);

  useEffect(() => {

    instance.current = new LogglyTracker();

    instance.current.push({
      ...options,
      sendConsoleErrors: false,
    });

    // Use our own global error handler to ensure errors are always reported with the same structure
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

  }, [ globalErrorHandler, options ]);

  return (
    <Provider value={{ error, info, providers, warn, instance: instance.current }}>
      {children}
    </Provider>
  );

};

export default LogglyProvider;
