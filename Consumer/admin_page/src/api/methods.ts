interface ApiMethod {
  readonly name?: string;
  readonly path: string;
  readonly type: string;
  readonly needSendAccessToken?: boolean;
  readonly url?: string;
  readonly convertQuery: (params: any) => any;
  readonly convertResult: (result: any) => any;
}

function defaultConverter(data: any): any { return data; }
function getDataConverter(data: any): any { return data; }

const RECEIVER_API_METHODS: {
  [key: string]: ApiMethod;
} = {
  "admin.auth.login": {path:"admin/auth/login",type:"POST",convertQuery:defaultConverter,convertResult:getDataConverter},
  "admin.auth.logout": {path:"admin/auth/logout",type:"POST",needSendAccessToken:true,convertQuery:defaultConverter,convertResult:getDataConverter},
  "admin.auth.check": {path:"admin/auth/check",type:"POST",needSendAccessToken:true,convertQuery:defaultConverter,convertResult:getDataConverter},
  "admin.auth.change": {path:"admin/auth/change",type:"POST",needSendAccessToken:true,convertQuery:defaultConverter,convertResult:getDataConverter},

  "receiver.config.providers.add":{path:"admin/config/providers/add",type:"POST",needSendAccessToken:true,convertQuery:defaultConverter,convertResult:getDataConverter},
  "receiver.config.providers.remove":{path:"admin/config/providers/remove",type:"POST",needSendAccessToken:true,convertQuery:defaultConverter,convertResult:getDataConverter},

  "receiver.config.consumers.add":{path:"admin/config/consumers/add",type:"POST",needSendAccessToken:true,convertQuery:defaultConverter,convertResult:getDataConverter},
  "receiver.config.consumers.update":{path:"admin/config/consumers/update",type:"POST",needSendAccessToken:true,convertQuery:defaultConverter,convertResult:getDataConverter},
  "receiver.config.consumers.remove":{path:"admin/config/consumers/remove",type:"POST",needSendAccessToken:true,convertQuery:defaultConverter,convertResult:getDataConverter},

  "receiver.config.rules.add":{path:"admin/config/rules/add",type:"POST",needSendAccessToken:true,convertQuery:defaultConverter,convertResult:getDataConverter},
  "receiver.config.rules.update":{path:"admin/config/rules/update",type:"POST",needSendAccessToken:true,convertQuery:defaultConverter,convertResult:getDataConverter},
  "receiver.config.rules.remove":{path:"admin/config/rules/remove",type:"POST",needSendAccessToken:true,convertQuery:defaultConverter,convertResult:getDataConverter},

  "receiver.messages.get": {path:"admin/messages/get",type:"GET",needSendAccessToken:true,convertQuery:defaultConverter,convertResult:getDataConverter},

  "receiver.config.get": {path:"admin/config",type:"GET",needSendAccessToken:true,convertQuery:defaultConverter,convertResult:getDataConverter}
}

export { RECEIVER_API_METHODS }
export type { ApiMethod }
