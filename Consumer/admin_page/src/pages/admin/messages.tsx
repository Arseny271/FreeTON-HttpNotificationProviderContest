import React, { useState, useRef, useEffect } from 'react';
import { runInAction } from "mobx"
import { observer, inject } from "mobx-react"

import { Header } from "../../components/navigation/header"
import { InputV2 } from "../../components/inputs/input-v2"
import { Button } from "../../components/buttons/button"

import { ApiReceiverManager } from "../../api/api"
import './css/messages.css';



/* */

interface PageAdminMessagesProps { onOpenSidebar: () => void; }

const PageAdminMessages = inject("configStore")(observer((props: PageAdminMessagesProps) => {
  const [messages, setMessages] = useState<any>([]);

  useEffect(() => {
    ApiReceiverManager.callMethod<any>("receiver.messages.get", {}).then((result) => {
      setMessages(result.data);
    });
  }, []);

  return <React.Fragment>
    <Header onOpenSidebar = {props.onOpenSidebar}/>
    <div className = "page-admin-page">
      <div className = "page-admin-provider-list">
        {messages.map((message: any, i: number) => {
          return <div className = "message-block" key = {i}>

            <p><b>Date: </b>{(new Date(message.date * 1000)).toString()}</p>
            <p><b>Consumer: </b>{message.user}</p>
            <p><b>Provider: </b>{message.provider}</p>
            <hr/>
            <p><b>From: </b>{message.notification.src}</p>
            <p><b>To: </b>{message.notification.dst}</p>
            <p><b>Value: </b>{message.notification.value_dec}</p>
            <hr/>

            <p className = "message-json">{JSON.stringify(message,  null, '\t')}</p>
          </div>
        })}
      </div>
    </div>
  </React.Fragment>
}));

export { PageAdminMessages }
