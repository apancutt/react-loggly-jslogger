import errorFormatter from './errorFormatter';
import loggly from './loggly';

const defaults = {
  logglyKey: process.env.REACT_APP_LOGGLY_CUSTOMER_TOKEN,
  sendConsoleErrors: true,
  tag: process.env.REACT_APP_LOGGLY_TAG,
  useUtfEncoding: true,
};

export default (config = {}) => {

  if (loggly) {

    const resolved = Object.assign({}, defaults, config);

    // Use our own implementation to ensure all errors are reported in the same format
    if (resolved.sendConsoleErrors) {
      resolved.sendConsoleErrors = false;
      window.addEventListener('error', (err) => loggly.push(errorFormatter(err)));
    }

    loggly.push(resolved);

  }

  return loggly;

};
