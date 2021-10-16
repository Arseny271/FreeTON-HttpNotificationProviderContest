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
import './css/providers.css';

/**/

interface ProviderSettingRowProps {
  providerId: any;
  providerSettings: any;
}

const ProviderSettingRow = inject("configStore")(observer((props: ProviderSettingRowProps) => {
  const { configStore } = props as any;
  const { providerId, providerSettings } = props;

  const removeProvider = (e: any) => {
    ApiReceiverManager.callMethod<any>("receiver.config.providers.remove", {
      provider_id: providerId
    }).then(() => runInAction(() => delete configStore.providers[providerId]));
    e.stopPropagation();
  }

  const [hidden, setHidden] = useState<boolean>(true);
  const header = <div className = "provider-info-header">
    <p>{`${providerSettings.name} (ID=${providerId})`}</p>
    <div className = "provider-info-header-icons">
      <Icon iconSize = "55%" url = "/icons/remove.svg" onClick = {removeProvider}/>
      <Icon iconSize = "55%" url = "/icons/down-arrow.svg" type = {hidden?"icon-r0":"icon-r180"}/>
    </div>
  </div>

  return <div className = "provider-info-dropdown">
    <DropdownContainer onHeaderClick = {() => setHidden(!hidden)} hidden = { hidden } header = { header }>
      <div className = "provider-info">
        <div className = "provider-info-info">
          <img alt = "" src = {`${providerSettings.url}${providerSettings.icon}`}/>
          <div className = "provider-info-block">
            <p className = "desc">{providerSettings.description}</p>
            <p>{`url: ${providerSettings.url}`}</p>
            <p>{`version: ${providerSettings.version}`}</p>
            <p>{`id: ${providerId}`}</p>
            <div className = "addr">
              <p>{`address: ${providerSettings.address}`}</p>
              <p>{`public key: ${providerSettings.public_key}`}</p>
            </div>
          </div>

          <div className = "provider-info-qrcode">
            <QrCodeContainer size = {110} value = {`https://uri.ton.surf/chat/${providerSettings.address}`} />
            <p>Support</p>
          </div>
        </div>
      </div>
    </DropdownContainer>
  </div>
}));



/**/

interface PageAdminProvidersProps { onOpenSidebar: () => void; }

const PageAdminProviders = inject("configStore")(observer((props: PageAdminProvidersProps) => {
  const { configStore } = props as any;

  const urlRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const newProviderAdd = () => {
    if (loading) return;

    const _providerUrl = (urlRef as any).current.value;
    const providerUrl = _providerUrl[_providerUrl.length-1]==="/"?_providerUrl.slice(0, -1):_providerUrl

    setLoading(true);
    fetch(`${providerUrl}/api/info`).then((result) => result.json()).then((providerConfig) => {
      if (providerConfig.id in configStore.providers) return;

      return ApiReceiverManager.callMethod<any>("receiver.config.providers.add", {
        provider: {...providerConfig, url: providerUrl}
      }).then(() => {
        runInAction(() => configStore.providers[providerConfig.id] = {...providerConfig, url: providerUrl})
      });
    }).finally(() => setLoading(false))
  }

  return <React.Fragment>
    <Header onOpenSidebar = {props.onOpenSidebar}/>
    <div className = "page-admin-page">
      <div className = "page-admin-provider-list">
        
        {Object.keys(configStore.providers).map((providerId, i) => {
          return <ProviderSettingRow providerId = { providerId } providerSettings = {configStore.providers[providerId]} key = {i}/>
        })}

        <div className = "provider-create-form">
          <div className = "provider-settings provider-info-info">
            <div className = "provider-settings-row">
              <p>Provider URL:</p>
              <div className = "provider-setting-input-row">
                <InputV2 ref = { urlRef } placeholder = "Provider url" className = "small-height"/>
                <Button onClick = { newProviderAdd } loading = { loading } text = "Add" type = "primary small-height"/>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  </React.Fragment>
}))

/*        */

export { PageAdminProviders }
