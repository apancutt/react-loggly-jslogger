import React, { createContext, useContext } from 'react';

const context = createContext({ error: (err, data = {}) => {}, info: (data) => {}, instance: null, providers: {}, warn: (data) => {} });
export default context;

export const Consumer = context.Consumer;
export const Provider = context.Provider;

export const useLoggly = () => useContext(context);

export const withLoggly = (Component) => (props) => (
  <Consumer>
    {(loggly) => (
      <Component loggly={loggly} {...props} />
    )}
  </Consumer>
);
