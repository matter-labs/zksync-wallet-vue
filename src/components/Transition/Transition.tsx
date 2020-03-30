import React, { useCallback, useEffect, useRef, FC } from 'react';
import { CSSTransition } from 'react-transition-group';

interface Props {
  trigger: boolean;
  type: 'scale' | 'opacity' | 'fly';
  timeout: number;
  [p: string]: any;
}

export const Transition: FC<Props> = ({
  timeout,
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
