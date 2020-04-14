import React from 'react';
import { Link as RRLink, useLocation } from 'react-router-dom';

export const Link = props => {
  const { pathname } = useLocation();
  return (
    <RRLink
      {...props}
      onClick={e => pathname === props.to && e.preventDefault()}
    />
  );
};
