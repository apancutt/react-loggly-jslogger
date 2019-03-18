export default (err, custom = {}) => ({
  file: err.fileName || err.filename,
  line: err.lineNumber || err.lineno,
  column: err.colno,
  message: err.message,
  stack: err.stack || (err.error ? err.error.stack : undefined),
  url: window.location.href,
  ...custom,
});
