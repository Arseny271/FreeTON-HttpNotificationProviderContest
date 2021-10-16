import React from 'react';
import { LoadingAnimation } from "../informs/loading"
import './input-v2.css';

interface InputV2Props {
  otherProps?: React.HTMLProps<HTMLInputElement>;

  className?: string;
  value?: string;
  type?: string;
  valid?: boolean;
  placeholder?: string;
  autoComplete?: string;
  defaultValue?: string;
  name?: string;
  id?: string;
  onClick?: (e?: React.MouseEvent<HTMLInputElement>) => void;
  onChange?: (e?: React.ChangeEvent<HTMLInputElement>) => void;

  children?: React.ReactNode;

  errorLabel?: string;
  loading?: boolean;
}

const InputV2 = React.forwardRef<HTMLInputElement, InputV2Props>((props, ref) => {
  const {type, placeholder, onClick, onChange, value, valid, autoComplete, name, id, defaultValue} = props;
  const inputProps = Object.assign({
    type, placeholder, onClick, onChange, value, valid: valid !== false?"true":"false", autoComplete, name, id, defaultValue
  }, props.otherProps);

  return <div className = {`input-v2-row ${props.className || ""}`}>
    <input className = "input-v2" ref = {ref} {...inputProps}/>
    {(props.children || props.loading) && <div className = "input-v2-side-block">
      {props.loading?<LoadingAnimation/>:props.children}
    </div>}
    {props.valid === false && props.errorLabel && <p className = "input-v2-error-label">{props.errorLabel}</p>}
  </div>
})

export { InputV2 }
