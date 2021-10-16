import React, { useState } from 'react';
import './mini-select.css';

interface MiniSelectProps {
  options: any[];
  onChange?: (val: number) => void;
  defaultValue?: number;
  value?: number;
}

const MiniSelect = (props: MiniSelectProps) => {
  const [optionsHidden, setOptionsHidden] = useState<boolean>(false);
  const [stateValue, setValue] = useState<number>(props.defaultValue || 0);
  const value = (props.value !== undefined) ? props.value : stateValue;

  if (optionsHidden) setTimeout(() => setOptionsHidden(false), 0);

  const onSelect = (index: number) => {
    setOptionsHidden(true);
    setValue(index);
    if (props.onChange) {
      props.onChange(index);
    }
  }

  return <div className = "mini-select">
    <div className = "mini-select-value">
      <p>{props.options[value]}</p>
    </div>
    {!optionsHidden && <div className = "mini-select-options-wrapper">
      <div className = "mini-select-options">
        {props.options.map((option: any, i: number) =>
          <p onClick = {() => onSelect(i)} key = {i}>{option}</p>)}
      </div>
    </div>}
  </div>;
}

export { MiniSelect }
