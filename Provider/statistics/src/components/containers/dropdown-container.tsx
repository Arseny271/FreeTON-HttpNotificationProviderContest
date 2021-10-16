import React, { useRef, useState } from 'react'
import './dropdown-container.css';

interface DropdownContainerProps {
  header: React.ReactNode;
  children: React.ReactNode;
  hidden?: boolean;
  onHeaderClick?: (e: any) => void;
}

const DropdownContainer: React.FunctionComponent< DropdownContainerProps> = (props) => {
  const [style, setStyle] = useState<string>(props.hidden?"hidden":"showed");
  const ref = useRef<HTMLDivElement>(null);

  const newStyle = props.hidden?"hidden":"showed";
  if (newStyle !== style && ref !== null && ref.current !== null && ref.current.firstChild !== null) {
    setStyle(newStyle);
    if (props.hidden === true) {
      ref.current.style.height = (ref.current.firstChild as HTMLElement).offsetHeight + "px";
      setTimeout(() => {if (ref !== null && ref.current !== null) ref.current.style.height = "0px"}, 0);
    } else {
      ref.current.style.height = (ref.current.firstChild as HTMLElement).offsetHeight + "px";
      setTimeout(() => {if (ref !== null && ref.current !== null) ref.current.style.height = ""}, 250);
    }
  }

  return <div className = "container-dropdown">
    <div className = "container-dropdown-header" onClick = {props.onHeaderClick}>
      {props.header}
    </div>
    <div ref = {ref} className = {`container-dropdown-body dropdown-container-${style}`}>
      <div>
        {props.children}
      </div>
    </div>
  </div>
}

export { DropdownContainer }
