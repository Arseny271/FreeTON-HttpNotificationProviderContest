import React, { useRef } from "react";
import { Redirect } from 'react-router-dom';

import { MiniSelect } from "../components/inputs/mini-select"
import { InputV2 } from "../components/inputs/input-v2"
import { Button } from "../components/buttons/button"

import { ApiReceiverManager } from "../api/api"
import { useLanguage } from "../utils/language-utils"

import "./css/auth.css";

const PageAuth = () => {
  const [language, languageId, setLanguage] = useLanguage();
  const loginRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const onLoginStart = () => {
    const login = (loginRef as any).current.value;
    const password = (passwordRef as any).current.value
    ApiReceiverManager.login(login, password, false).then((result) => {
      window.location.reload();
    }).catch((error) => {alert()})
  }

  return <div className = "page-auth">
    { ApiReceiverManager.fastCheckAuth() && <Redirect to="/admin"/> }
    <div className = "auth-form-wrapper">
      <form className = "auth-form">
        <h2>TON NOTIFICATION RECEIVER</h2>
        <InputV2 ref = { loginRef } className = "large-height montserrat-font" placeholder = { language.auth.login }/>
        <InputV2 ref = { passwordRef } className = "large-height montserrat-font" type = "password" placeholder = { language.auth.password }/>
        <Button onClick = { onLoginStart } type = "primary" text = { language.auth.auth }/>
      </form>
    </div>
  </div>
}

export { PageAuth }
