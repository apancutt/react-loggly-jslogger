import { useContext } from 'react';
import context from './context';

const useLoggly = () => useContext(context);

export default useLoggly;
