import React from 'react';
import { Link, useRouteMatch } from "react-router-dom";
import { Icon } from "../informs/icon"
import './sidebar-button.css';

interface SidebarButtonProps {
  icon?: string;
  text: string;
  subbuttons?: SidebarButtonProps[];
  url?: string;
  onClick?: () => void;
}

interface SidebarButtonListProps {
  buttons: SidebarButtonProps[];
}


const SidebarButton: React.FunctionComponent<(SidebarButtonProps)> = (props) => {
  const match = useRouteMatch(props.url || "");

  const isActive = (match && props.url);
  const activeClassName: string = (match && props.url)?"button-sidebar-active":"button-sidebar-inactive"

  return <div className = {`button-sidebar ${activeClassName}`}>
    {props.url?
      <Link draggable="false" to = {props.url} className = "button-sidebar-body" onClick = {props.onClick}>
        <Icon iconColor = {isActive?"var(--main-primary-color)":"white"} url = {props.icon || ""}/>
        <p>{props.text}</p>
      </Link>:
      <div className = "button-sidebar-body" onClick = {props.onClick}>
        <Icon iconColor = {isActive?"var(--main-primary-color)":"white"} url = {props.icon || ""}/>
        <p>{props.text}</p>
      </div>
    }

    <SidebarButtonList buttons = {(props.subbuttons)?(props.subbuttons):[]}/>
  </div>;
};

const SidebarButtonList: React.FunctionComponent<SidebarButtonListProps> = (props) => {
  return <div className = "button-sidebar-subbuttons">{
    props.buttons.map((buttonProps: SidebarButtonProps, i:number): React.ReactNode => {
      return <SidebarButton key = {i} {...buttonProps}/>
    })
  }</div>
}

export { SidebarButton, SidebarButtonList }
