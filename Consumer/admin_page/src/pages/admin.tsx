import { useState, useEffect } from "react";
import { Switch, Redirect, Route } from "react-router-dom";
import { observer, inject } from "mobx-react"

import { NavigationSidebar }  from "../components/navigation/sidebar"
import { SidebarButtonList }  from "../components/navigation/sidebar-button"
import { ApiReceiverManager } from "../api/api"

import { PageAdminProviders } from "./admin/providers"
import { PageAdminConsumers } from "./admin/consumers"
import { PageAdminSettings } from "./admin/settings"
import { PageAdminMessages } from "./admin/messages"

import { useLanguage } from "../utils/language-utils"
import "./css/admin.css";


const PageAdmin = inject("configStore")(observer((props: any) => {
  const { configStore } = props as any;

  const [language, languageId, setLanguage] = useLanguage();
  const [close, setClose] = useState<boolean>(true);
  useEffect(() => {ApiReceiverManager.checkAuth().then((res) => {if (res) configStore.update()})}, []);

  return <div className = "page-admin">
    <NavigationSidebar onClose = {() => setClose(true)} isClose = {close}>
      <div className = "page-admin-sidebar-buttons">
        <SidebarButtonList buttons = {[
          {text: language.sidebar.providers,  icon: "/icons/sidebar/services.svg",  url:"/admin/providers", onClick:()=>setClose(true)},
          {text: language.sidebar.consumers,  icon: "/icons/sidebar/services.svg",  url:"/admin/consumers", onClick:()=>setClose(true)},
          {text: language.sidebar.messages,   icon: "/icons/sidebar/messages.svg",  url:"/admin/messages", onClick:()=>setClose(true)},
          {text: language.sidebar.settings,   icon: "/icons/sidebar/settings.svg",  url:"/admin/settings", onClick:()=>setClose(true)},
        ]}/>
      </div>
    </NavigationSidebar>
    <div className = "page-admin-body">
      <Switch>
        { (!ApiReceiverManager.fastCheckAuth()) && <Redirect to="/auth"/> }
        <Route path="/admin/statistics" render = {() => <PageAdminProviders onOpenSidebar = {() => setClose(false)}/>}/>
        <Route path="/admin/providers" render = {() => <PageAdminProviders onOpenSidebar = {() => setClose(false)}/>}/>
        <Route path="/admin/consumers" render = {() => <PageAdminConsumers onOpenSidebar = {() => setClose(false)}/>}/>
        <Route path="/admin/messages" render = {() => <PageAdminMessages onOpenSidebar = {() => setClose(false)}/>}/>
        <Route path="/admin/settings" render = {() => <PageAdminSettings onOpenSidebar = {() => setClose(false)}/>}/>
        <Redirect from = "/admin" to = "/admin/providers"/>
      </Switch>
    </div>
  </div>
}));

export { PageAdmin }
