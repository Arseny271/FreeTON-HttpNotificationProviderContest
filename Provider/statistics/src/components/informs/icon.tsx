import React from 'react';
import './icon.css';

type IconProps = React.HTMLProps<HTMLDivElement> &  {
  otherProps?: React.HTMLProps<HTMLDivElement>;
  onClick?: (e?: React.MouseEvent<HTMLDivElement>) => void;

  url: string;
  iconColor?: string;
  iconPosition?: string;
  iconSize?: string;
  children?: React.ReactNode;
  isHidden?: boolean;
  type?: string;
};

const Icon: React.FunctionComponent<IconProps> = (props) => {
  const { onClick } = props;
  const iconProps = Object.assign({
    onClick
  }, props.otherProps);

  return <div {...iconProps} className = {`${!props.isHidden?"icon":"icon icon-hidden"} ${props.type}`} style = {{
    backgroundColor: props.iconColor,
    WebkitMaskImage: `url(${props.url})`,
    WebkitMaskSize: props.iconSize,
    WebkitMaskPosition: props.iconPosition
  }}>{props.children}</div>
};

export { Icon }
