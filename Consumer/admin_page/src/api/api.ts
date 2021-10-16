import type { ApiMethod } from "./methods";
import { RECEIVER_API_METHODS } from "./methods"

interface AnyObject {[key: string]: any}
interface FetchResult {
  status: number;
  result: AnyObject;
}

class ApiWrapper {
  private methodsMap: any;
  private accessToken: string | null;
  private needRemember: boolean;
  readonly apiUrl: string;

  constructor(url: string, methodsMap: any) {
    this.methodsMap = methodsMap;
    this.apiUrl = url;
    this.loadTokens();
  }

  /* Public functions */

  public async login(login: string, password: string, needRemember: boolean): Promise<ApiMethodCallResult<any>> {
    return this.callMethod<any>("admin.auth.login", {login, password}).then((result) => {
      this.updateTokens(result.data.token, needRemember);
      return result;
    })
  }

  public async logout(): Promise<ApiMethodCallResult<any>> {
    return this.callMethod<any>("admin.auth.logout", {}).then((result) => {
      this.removeTokens();
      this.accessToken = null;
      window.location.reload();
      return result;
    })
  }

  public async checkAuth(): Promise<boolean> {
    if (!this.fastCheckAuth())
      return false;

    return this.callMethod("admin.auth.check", {}).then(() => true, () => {
      this.removeTokens();
      window.location.reload();
      return false;
    });
  }

  public fastCheckAuth(): boolean {
    return (this.accessToken !== null && this.accessToken !== undefined);
  }

  public async callMethod<T>(methodName: string, params: AnyObject, needRetry: boolean = true): Promise<ApiMethodCallResult<T>> {
    const method: ApiMethod = this.methodsMap[methodName];
    return this.fetchMethod(method, params).then(
      (result: FetchResult) => {
        const resultCodeGroup: number = (result.status / 100 | 0);
        if (resultCodeGroup === 2) {
          const apiResult: any = method.convertResult(result.result);
          return new ApiMethodCallResult<T>(result.status, apiResult);
        } /*else if (resultCodeGroup === 4 && needRetry) {
          if ((result.result.message === "jwt expired" || result.result.name === "UnauthorizedError") && method.needSendAccessToken) {
            return this.callRefreshToken().then(
              () => this.callMethod(methodName, params, false),
              () => {throw new ApiMethodCallError(result.status, result.result, method)}
            );
          }
        }*/

        throw new ApiMethodCallError(result.status, result.result, method);
    });
  }



  /*
   * Returns the result of a direct call to the server
   * can repeat the request in case of failure
   */

  private fetchMethod(method: ApiMethod, params: AnyObject, retryCount: number = 5): Promise<FetchResult> {
    return this.fetch(method, params).then(
      async (response) => {
        let result: AnyObject;
        try {
          result = await response.json();
        } catch {
          result = {}
        }
        const status: number = response.status;
        return {status, result};
      },
      (error) => {
        if (retryCount > 1)
          return new Promise((resolve, reject) => setTimeout(() => resolve(null), 1000))
            .then(() => this.fetchMethod(method, params, retryCount - 1))
        throw new ApiMethodCallError(0, {error}, method);
      }
    )
  }



  /*
   * Returns the result of contacting the server
   */

  private fetch(method: ApiMethod, params_: AnyObject): Promise<any> {
    const params = method.convertQuery(params_);
    const keys: string[] = Object.keys(params);
    const pathWithVariables: string = method.path.split(":").map((param, i) => {
      if (i % 2 === 1) {
        const index = keys.indexOf(param);
        if (index > -1) {
          keys.splice(index, 1);
          return params[param];
        }
      }
      return param;
    }).join("");

    const bodyParams: any = {};
    for (let key of keys)
      bodyParams[key] = params[key];

    const pathParams: string = (method.type === "GET")?
      this.createUrlParams(bodyParams):"";


    const methodUrl = method.url?method.url:this.apiUrl;
    const fullRequestPath: string = `${methodUrl}${pathWithVariables}${pathParams}`
    const requestParams: any = {
      headers: this.createFetchHeaders(method, bodyParams),
      method: method.type,
      redirect: "follow"
    }

    if (method.type !== "GET")
      requestParams.body = bodyParams.formdata ? bodyParams.formdata : JSON.stringify(bodyParams);

    return fetch(fullRequestPath, requestParams);
  }

  public setAccessToken(accessToken: string) {
    this.updateTokens(accessToken, this.needRemember);
  }

  /* Private functions */

  private updateTokens(accessToken: string, needRemember: boolean) {
    this.accessToken = accessToken;
    this.needRemember = needRemember;

    localStorage.setItem("storage", needRemember?"local":"session");
    this.getUserStorage().setItem("accessToken", accessToken);
  }

  private loadTokens() {
    const storage: string | null = localStorage.getItem("storage");
    if (storage === null) return;

    this.needRemember = storage === "local";
    this.accessToken = this.getUserStorage().getItem("accessToken");
  }

  private removeTokens() {
    localStorage.removeItem("storage")
    localStorage.removeItem("accessToken")
    sessionStorage.removeItem("accessToken")
  }

  private getUserStorage(): any {
    return this.needRemember?
      localStorage:sessionStorage;
  }

  private createUrlParams(params: AnyObject): string {
    if (Object.keys(params).length === 0) return "";
    return `?${Object.keys(params).map((key) =>
      `${key}=${encodeURIComponent(params[key])}`).join("&")}`
  }

  protected createFetchHeaders(method: ApiMethod, params: any): Headers {
    const headers: Headers = new Headers();
    if (!params.formdata) headers.append("Content-Type", "application/json");

    if (method.needSendAccessToken)
      headers.append("Authorization", `${this.accessToken}`);

    return headers;
  }
}

class ApiMethodCallResult<T> {
  constructor(status: number, data: T) {
    this.status = status;
    this.type = status / 100 | 0;
    this.data = data;
  }

  readonly status: number;
  readonly type: number;
  readonly data: T;
}

class ApiMethodCallError extends Error {
  constructor(status: number, data: AnyObject, method: ApiMethod) {
      super("Ошибка вызова метода");
      this.status = status;
      this.method = method;
      this.type = status / 100 | 0;
      this.data = data;
      console.error(this);
  }

  readonly method: ApiMethod;
  readonly status: number;
  readonly type: number;
  readonly data: AnyObject;
}

console.log(window.location.hostname === "localhost"?
"http://ton-callback.arsenicum12.ru:8001/":"/");


const ApiReceiverManager: ApiWrapper = new ApiWrapper(window.location.hostname === "localhost"?
  "http://ton-callback.arsenicum12.ru:8001/":"/", RECEIVER_API_METHODS);

export { ApiReceiverManager }
export { ApiWrapper, ApiMethodCallResult, ApiMethodCallError }
