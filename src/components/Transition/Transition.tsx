import React, { useCallback, useEffect, useRef, FC } from 'react';
import { CSSTransition } from 'react-transition-group';

interface Props extends Record<string, any> {
  trigger: boolean;
  type: 'scale' | 'opacity' | 'fly' | 'modal';
  timeout?: number;
}

export const Transition: FC<Props> = ({
  timeout = 200,
  trigger,
  type,
  children,
  ...rest
}) => (
  <CSSTransition
    classNames={`transition-${type}`}
    unmountOnExit
    timeout={timeout}
    in={trigger}
    {...rest}
  >
    {children}
  </CSSTransition>
);
