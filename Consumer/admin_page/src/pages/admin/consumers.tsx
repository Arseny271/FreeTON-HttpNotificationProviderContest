import React, { useState, useEffect, useRef } from 'react';
import { runInAction } from "mobx"
import { observer, inject } from "mobx-react"

import { Header } from "../../components/navigation/header"
import { DropdownContainer } from "../../components/containers/dropdown-container"
import { QrCodeContainer } from "../../components/containers/qrcode-container"
import { InputV2 } from "../../components/inputs/input-v2"
import { Button } from "../../components/buttons/button"
import { Icon } from "../../components/informs/icon"

import { ApiReceiverManager } from "../../api/api"
import './css/consumers.css';

/**/

interface ConsumerSettingRuleBlockProps {
  hash: string;
  provider_id: string;
  rule: any;
}

const ConsumerSettingRuleBlock = inject("configStore")(observer((props: ConsumerSettingRuleBlockProps) => {
  const { configStore } = props as any;
  const { provider_id, hash, rule } = props;

  const [saveLoading, setSaveLoading] = useState<boolean>(false);
  const [removeLoading, setRemoveLoading] = useState<boolean>(false);

  const forwardRef = useRef<HTMLInputElement>(null);
  const secretRef = useRef<HTMLInputElement>(null);

  const updateProviderRule = () => {
    const forwardHex = (forwardRef as any).current.value;
    const secretHex = (secretRef as any).current.value;

    setSaveLoading(true);
    ApiReceiverManager.callMethod<any>("receiver.config.rules.update", {
      rule: {hash, provider_id, secret: secretHex, forward: forwardHex}
    }).then(() => {
      runInAction(() => configStore.consumers[hash].rules[provider_id] = {secret: secretHex, forward: forwardHex})
    }).finally(() => setSaveLoading(false));
  }

  const removeProviderRule = () => {
    setRemoveLoading(true);
    ApiReceiverManager.callMethod<any>("receiver.config.rules.remove", {
      rule: {hash, provider_id}
    }).then(() => {
      runInAction(() => delete (configStore.consumers[hash].rules)[provider_id])
    }).finally(() => setRemoveLoading(false));
  }

  return <React.Fragment>
    <p className = "setting-subheader"><b>{provider_id}:</b></p>              
    <div className = "admin-setting-input-row-multiline hash provider-rule-block">
      <form autoComplete = "off" className = "consumer-provider-rule"> 
        <p>Secret:</p>
        <InputV2 ref = { secretRef } defaultValue = {rule.secret} type = "text" className = "small-height"/>
        <p>Forward url:</p>
        <InputV2 ref = { forwardRef } defaultValue = {rule.forward} type = "text" className = "small-height"/>
        <div className = "rules-button">
          <Button loading = { saveLoading } onClick = {updateProviderRule} text = "Save" type = "primary small-height"/>
          <Button loading = { removeLoading } onClick = {removeProviderRule} text = "Remove" type = "secondary small-height"/>
        </div>
      </form>
    </div>
  </React.Fragment>
}))



/**/

interface ConsumerSettingRowProps {
  hash: string;
  consumerSettings: any;
}

const ConsumerSettingRow = inject("configStore")(observer((props: ConsumerSettingRowProps) => {
  const { configStore } = props as any;
  const { hash, consumerSettings } = props;

  const pkeyRef = useRef<HTMLInputElement>(null);
  const skeyRef = useRef<HTMLInputElement>(null);

  const providerSelectRef = useRef<HTMLSelectElement>(null);

  const [loading, setLoading] = useState<boolean>(false);

  const removeConsumer = (e: any) => {
    ApiReceiverManager.callMethod<any>("receiver.config.consumers.remove", {
      hash
    }).then(() => runInAction(() => delete configStore.consumers[hash]));
    e.stopPropagation();
  }

  const updateConsumer = (e: any) => {
    const consumerPkey = (pkeyRef as any).current.value;
    const consumerSkey = (skeyRef as any).current.value;
    setLoading(true);
    ApiReceiverManager.callMethod<any>("receiver.config.consumers.update", {
      consumer: {hash, public_key: consumerPkey, secret_key: consumerSkey}
    }).then(() => {
      runInAction(() => configStore.consumers[hash] = {rules: consumerSettings.rules, hash, public_key: consumerPkey, secret_key: consumerSkey})
    }).finally(() => setLoading(false));
  }

  const addProviderRule = () => {
    const provider_id =  (providerSelectRef as any).current.value;
    
    ApiReceiverManager.callMethod<any>("receiver.config.rules.add", {
      rule: { hash, provider_id, secret:"", forward:"localhost:8924"}
    }).then(() => runInAction(() => configStore.consumers[hash].rules[provider_id] = {secret:"", forward:"localhost:8924"}));
  }

  const [hidden, setHidden] = useState<boolean>(false);
  const header = <div className = "provider-info-header">
    <p>{`${hash.slice(0, 12)}.......${hash.slice(-12)}`}</p>
    <div className = "provider-info-header-icons">
      <Icon iconSize = "55%" url = "/icons/remove.svg" onClick = {removeConsumer}/>
      <Icon iconSize = "55%" url = "/icons/down-arrow.svg" type = {hidden?"icon-r0":"icon-r180"}/>
    </div>
  </div>

  return <div className = "provider-info-dropdown">
    <DropdownContainer onHeaderClick = {() => setHidden(!hidden)} hidden = { hidden } header = { header }>

      <div className = "consumer-info">
        <div className = "admin-settings-row consumer-data">
          <p><b>Hash: </b>{hash}</p>
        </div>
      </div>

      <div className = "consumer-info">
        <div className = "admin-settings-row">
          <p className = "setting-header"><b>Consumer settings:</b></p>
          <div className = "admin-setting-input-row-multiline hash">
            <form autoComplete = "off" className = "consumer-provider-rule"> 
              <p>Encryption public key:</p>
              <InputV2 ref = { pkeyRef } type = "text" defaultValue = {consumerSettings.public_key} className = "small-height"/>
              <p>Decryption secret key:</p>
              <InputV2 ref = { skeyRef } type = "text" defaultValue = {consumerSettings.secret_key} className = "small-height"/>
              <Button onClick = { updateConsumer } loading = { loading } text = "Save" type = "primary small-height"/>
            </form>
          </div>
        </div>
      </div>

      <div className = "consumer-info">
        <div className = "admin-settings-row">
          <p className = "setting-header"><b>Rules:</b></p>
          <div className = "consumer-info-rules-list">
            {
              Object.keys(consumerSettings.rules).map((providerId: string, i: number) => {
                return <ConsumerSettingRuleBlock key = {i} rule = { consumerSettings.rules[providerId] } hash = { hash} provider_id = { providerId }/>
              })
            }
          </div>
        </div>
      </div>

      <div className = "consumer-info">
        <div className = "admin-settings-row">
          <p>Add provider rule:</p>
          <div className = "admin-setting-input-row-multiline hash">
            <form autoComplete = "off" className = "add-provider-to-consumer"> 
              <select ref = { providerSelectRef }>
                {Object.keys(configStore.providers).map((providerId, i) => {
                  return <option value = {providerId} key = {i}>{providerId}</option>
                })}
              </select>
              <Button  onClick = {addProviderRule} loading = { loading } text = "Add" type = "primary small-height"/>
            </form>
          </div>
        </div>
      </div>
    </DropdownContainer>
  </div>
}));

/* <p className = "rule-status">Status: <b>Active</b></p> */


/**/

interface PageAdminConsumersProps { onOpenSidebar: () => void; }

const PageAdminConsumers = inject("configStore")(observer((props: PageAdminConsumersProps) => {
  const { configStore } = props as any;

  const hashRef = useRef<HTMLInputElement>(null);
  const pkeyRef = useRef<HTMLInputElement>(null);
  const skeyRef = useRef<HTMLInputElement>(null);
  
  const [loading, setLoading] = useState<boolean>(false);

  const newConsumerAdd = () => {
    if (loading) return;

    const consumerHash = (hashRef as any).current.value;
    const consumerPkey = (pkeyRef as any).current.value;
    const consumerSkey = (skeyRef as any).current.value;
    setLoading(true);

    ApiReceiverManager.callMethod<any>("receiver.config.consumers.add", {
      consumer: {hash: consumerHash, public_key: consumerPkey, secret_key: consumerSkey}
    }).then(() => {
      runInAction(() => configStore.consumers[consumerHash] = {rules: {}, hash: consumerHash, public_key: consumerPkey, secret_key: consumerSkey})
    }).finally(() => setLoading(false));
  }

  return <React.Fragment>
    <Header onOpenSidebar = {props.onOpenSidebar}/>
    <div className = "page-admin-page">
      <div className = "page-admin-provider-list">
        {Object.keys(configStore.consumers).map((hash, i) => {
          return <ConsumerSettingRow hash = {hash} consumerSettings = {configStore.consumers[hash]} key = {i}/>
        })}
        <div className = "consumer-create-form">
          <div className = "admin-settings-row">
            <p>Add Consumer:</p>
            <div className = "admin-setting-input-row-multiline hash">
              <form autoComplete = "off"> 
                <InputV2 ref = { hashRef } placeholder = "Hash" type = "text" className = "small-height"/>
                <InputV2 ref = { pkeyRef } placeholder = "Public encryption key" type = "text" className = "small-height"/>
                <InputV2 ref = { skeyRef } placeholder = "Secret decryption key" type = "text" className = "small-height"/>
                <Button onClick = { newConsumerAdd } loading = { loading } text = "Add" type = "primary small-height"/>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </React.Fragment>
}))

/*        */

export { PageAdminConsumers }
