(this["webpackJsonpyour-app-name"]=this["webpackJsonpyour-app-name"]||[]).push([[0],{75:function(t,e,n){},82:function(t,e,n){},83:function(t,e,n){"use strict";n.r(e);var o=n(1),i=n.n(o),s=n(44),a=n.n(s),c=n(46),r=n(3),l=n(31),d=n(10),j=(n(75),n(2)),f=function(){var t=Object(o.useState)(void 0),e=Object(l.a)(t,2),n=e[0],i=e[1],s=Object(o.useState)(void 0),a=Object(l.a)(s,2),c=a[0],r=a[1];return Object(o.useEffect)((function(){var t=Math.floor(Date.now()/1e3);fetch("https://debot.events.ton.arsen12.ru/api/statistics",{headers:{"Content-Type":"application/json"},method:"POST",body:JSON.stringify({start_time:60*Math.floor((t-3600)/60),end_time:t,period:60})}).then((function(t){return t.json()})).then((function(t){i(t)})),fetch("https://debot.events.ton.arsen12.ru/api/statistics",{headers:{"Content-Type":"application/json"},method:"POST",body:JSON.stringify({start_time:1800*Math.floor((t-86400)/1800),end_time:t,period:1800})}).then((function(t){return t.json()})).then((function(t){r(t)}))}),[]),Object(j.jsxs)("div",{className:"page-stat",children:[Object(j.jsx)("h1",{children:" Free TON Notification provider statistics "}),Object(j.jsxs)("div",{className:"page-chart-block",children:[Object(j.jsx)("h2",{children:"Messages delivered (last hour)"}),Object(j.jsx)("div",{className:"page-chart",children:n&&Object(j.jsxs)(d.a,{xType:"time",color:"#ff2400",animation:!0,margin:{left:35,right:35,top:15,bottom:60},children:[Object(j.jsx)(d.c,{tickPadding:25,style:{fontFamily:"Roboto",fontSize:"12px",fontStyle:"normal",fontWeight:"500",fill:"#A5A5A5",stroke:"none"}}),Object(j.jsx)(d.d,{style:{fontFamily:"Roboto",fontSize:"12px",fontStyle:"normal",fontWeight:"500",fill:"#A5A5A5",stroke:"none"}}),Object(j.jsx)(d.b,{color:"var(--main-primary-color)",style:{fill:"none",strokeWidth:"1"},data:n.messages_delivered.map((function(t,e){return{x:new Date(1e3*n.x[e]),y:t}}))})]})})]}),Object(j.jsxs)("div",{className:"page-chart-block",children:[Object(j.jsx)("h2",{children:"Messages delivered (last 24 hours)"}),Object(j.jsx)("div",{className:"page-chart",children:c&&Object(j.jsxs)(d.a,{xType:"time",color:"#ff2400",animation:!0,margin:{left:35,right:35,top:15,bottom:60},children:[Object(j.jsx)(d.c,{tickPadding:25,style:{fontFamily:"Roboto",fontSize:"12px",fontStyle:"normal",fontWeight:"500",fill:"#A5A5A5",stroke:"none"}}),Object(j.jsx)(d.d,{style:{fontFamily:"Roboto",fontSize:"12px",fontStyle:"normal",fontWeight:"500",fill:"#A5A5A5",stroke:"none"}}),Object(j.jsx)(d.b,{color:"var(--main-primary-color)",style:{fill:"none",strokeWidth:"1"},data:c.messages_delivered.map((function(t,e){return{x:new Date(1e3*c.x[e]),y:t}}))})]})})]})]})},h=function(){return Object(j.jsx)(i.a.Fragment,{children:Object(j.jsx)(c.a,{children:Object(j.jsxs)(r.d,{children:[Object(j.jsx)(r.b,{path:"/",component:f}),Object(j.jsx)(r.a,{to:"/"})]})})})},b=function(t){t&&t instanceof Function&&n.e(3).then(n.bind(null,85)).then((function(e){var n=e.getCLS,o=e.getFID,i=e.getFCP,s=e.getLCP,a=e.getTTFB;n(t),o(t),i(t),s(t),a(t)}))};n(82);a.a.render(Object(j.jsx)(i.a.StrictMode,{children:Object(j.jsx)(h,{})}),document.getElementById("root")),b()}},[[83,1,2]]]);
//# sourceMappingURL=main.6df54b68.chunk.js.map