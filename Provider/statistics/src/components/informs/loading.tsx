import React from 'react';
import './loading.css';

interface LoadingAnimationProps {
  hidden?: boolean;
};

const LoadingAnimation: React.FunctionComponent<LoadingAnimationProps> = (props) => {
  return <div className = "loading-animation-wrapper" style = {{display: props.hidden?"none":"block"}} ><progress className = "progress-round"/></div>
};

export { LoadingAnimation }
