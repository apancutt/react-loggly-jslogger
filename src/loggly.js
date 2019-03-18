import { _LTracker } from 'loggly-jslogger';

export default process.env.REACT_APP_LOGGLY_CUSTOMER_TOKEN ? _LTracker : null;
