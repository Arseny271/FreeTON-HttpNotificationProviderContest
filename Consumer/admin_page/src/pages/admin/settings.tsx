import React, { useState, useRef, useEffect } from 'react';
import { runInAction } from "mobx"
import { observer, inject } from "mobx-react"

import { Header } from "../../components/navigation/header"
import { InputV2 } from "../../components/inputs/input-v2"
import { Button } from "../../components/buttons/button"

import { ApiReceiverManager } from "../../api/api"
import './css/settings.css';

/* */

interface PageAdminSettingsAuthProps {  }

const PageAdminSettingsAuth = (props: PageAdminSettingsAuthProps) => {
  const [loading, setLoading] = useState<boolean>(false);

  const newLoginRef = useRef<HTMLInputElement>(null);
  const newPasswordRef = useRef<HTMLInputElement>(null);
  const oldPasswordRef = useRef<HTMLInputElement>(null);

  const onPasswordChange = () => {
    if (loading) return;

    const new_login = (newLoginRef as any).current.value;
    const new_password = (newPasswordRef as any).current.value;
    const old_password = (oldPasswordRef as any).current.value;

    setLoading(true);
    ApiReceiverManager.callMethod<any>("admin.auth.change", {
      new_login, new_password, old_password
    }).then((result) => {
      ApiReceiverManager.setAccessToken(result.data.token);
      alert("success")
    }).catch(() => {
      alert("401")
    }).finally(() => setLoading(false));
  }

  return <div className = "admin-settings-row">
    <p>Change login and password:</p>
    <div className = "admin-setting-input-row-multiline">
      <form autoComplete = "off"> 
        <InputV2 ref = { newLoginRef } placeholder = "New login" className = "small-height"/>
        <InputV2 ref = { newPasswordRef } placeholder = "New password" type = "password" className = "small-height"/>
        <InputV2 ref = { oldPasswordRef } placeholder = "Old password" type = "password" className = "small-height"/>
        <Button loading = { loading } onClick = { onPasswordChange } text = "Change" type = "primary small-height"/>
      </form>
    </div>
  </div>
}


/* */

interface PageAdminSettingsProps { onOpenSidebar: () => void; }

const PageAdminSettings = inject("configStore")(observer((props: PageAdminSettingsProps) => {
  return <React.Fragment>
    <Header onOpenSidebar = {props.onOpenSidebar}/>
    <div className = "page-admin-page">
      <div className = "page-admin-block">
        <PageAdminSettingsAuth/>
      </div>
    </div>
  </React.Fragment>
}));

export { PageAdminSettings }
