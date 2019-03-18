import { createContext } from 'react';
import errorFormatter from './errorFormatter';
import loggly from './loggly';

export default createContext({ errorFormatter, loggly });
