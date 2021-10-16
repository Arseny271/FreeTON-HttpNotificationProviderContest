import React from 'react';
import { Icon } from "../informs/icon";
import './header.css';


interface HeaderProps {
  onOpenSidebar: () => void;
  children?: React.ReactNode;
}

const Header = (props: HeaderProps) => {
  return <React.Fragment>
    <div className = "page-user-header-fake"/>
    <div className = "page-user-header">
      <Icon iconSize = "45%" url = "/icons/menu.svg" onClick = {props.onOpenSidebar} type = "header-show-sidebar"/>
      { props.children }
    </div>
  </React.Fragment>
}

export { Header }
