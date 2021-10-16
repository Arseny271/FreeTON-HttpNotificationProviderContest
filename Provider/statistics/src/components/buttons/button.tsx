import React from 'react';
import { LoadingAnimation } from "../informs/loading"
import { Link } from 'react-router-dom';
import './button.css';

type ButtonProps = React.HTMLProps<HTMLElement> & {
  type: string;
  text: string;
  loading? :boolean;
  link? :string;
}

const Button: React.FunctionComponent<ButtonProps> = (props) => {
  if (props.link) {
    return <Link to = {props.link} className = {`button button-type-${props.type}`} onClick = {props.onClick} >
      {props.text}
      {props.loading && <LoadingAnimation hidden = {false}/>}
    </Link>;
  } else {
    return <div className = {`button ${props.loading?"button-loading":""} button-type-${props.type}`} onClick = {props.onClick} >
      {props.text}
      {props.loading && <LoadingAnimation hidden = {false}/>}
    </div>;
  }
};

export { Button }
