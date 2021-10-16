import React from 'react';
import './sidebar.css';

interface NavigationSidebarProps {
  isClose: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const NavigationSidebar: React.FunctionComponent<NavigationSidebarProps> = (props) => {
  return <React.Fragment>
    <div className = {`page-user-sidebar-parent sidebar-${props.isClose?"close":"open"}`} onClick = {() => props.onClose()}/>
    <div className = {`page-user-sidebar sidebar-${props.isClose?"close":"open"}`}>
      <div className = "page-user-sidebar-logo"><h2>TON NOTICES RECEIVER</h2></div>
      { props.children }
    </div>
    <div className = "page-user-sidebar sidebar-fake"/>
  </React.Fragment>
}

export { NavigationSidebar }
