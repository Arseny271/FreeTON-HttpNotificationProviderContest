import React, { useState, useContext } from 'react';

const ENGLISH_MAP = {
  auth: {
    login: "Login",
    password: "Password",
    auth: "Login",
    incorrect: "Incorrect login or password"
  },
  sidebar: {
    statistics: "Statistics",
    providers: "Providers",
    consumers: "Consumers",
    messages: "Messages",
    settings: "Settings"
  }
}

const RUSSIAN_MAP = {
  auth: {
    login: "Логин",
    password: "Пароль",
    auth: "Войти",
    incorrect: "Неправильный логин или пароль"
  },
  sidebar: {
    statistics: "Статистка",
    providers: "Провайдеры",
    consumers: "Получатели",
    messages: "Сообщения",
    settings: "Настройки"
  }
}


const MAPS: any = { "en": [0, ENGLISH_MAP], "ru": [1, RUSSIAN_MAP] }
const LanguageContext = React.createContext<any>({lang: MAPS["en"][1], index: MAPS["en"][0], set: ()=>{}});

interface LanguageProviderProps {
  children: React.ReactNode;
}

const LanguageProvider = (props: LanguageProviderProps) => {
  const [lang, setLang] = useState<string>("en");
  return <LanguageContext.Provider value = {{lang: MAPS[lang][1], index: MAPS[lang][0], set: setLang}}>
    {props.children}
  </LanguageContext.Provider>
}

function useLanguage(): any {
  const {lang, index, set} = useContext(LanguageContext);
  return [lang, index, set]
}

export { LanguageProvider, useLanguage }
