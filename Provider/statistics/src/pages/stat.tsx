import React, { useEffect, useState } from "react";
import { FlexibleXYPlot, XAxis, YAxis, LineSeries, LineMarkSeries } from 'react-vis';


import "./css/auth.css";

const PageStat = () => {
  const [stat, setStat] = useState<any>(undefined);
  const [stat2, setStat2] = useState<any>(undefined);

  useEffect(() => {
    const currentTime = Math.floor(Date.now() / 1000);

    fetch("https://debot.events.ton.arsen12.ru/api/statistics", {
      headers: { 'Content-Type': 'application/json' }, 
      method: "POST", body: JSON.stringify({
        "start_time": Math.floor((currentTime - 3600) / 60) * 60, "end_time": currentTime, "period": 60
      })
    }).then(result => result.json()).then(result => {
      setStat(result);
    })

    fetch("https://debot.events.ton.arsen12.ru/api/statistics", {
      headers: { 'Content-Type': 'application/json' }, 
      method: "POST", body: JSON.stringify({
        "start_time":  Math.floor((currentTime - 86400) / 1800) * 1800, "end_time": currentTime, "period": 1800
      })
    }).then(result => result.json()).then(result => {
      setStat2(result);
    })

  }, []);


  return <div className = "page-stat">
    <h1> Free TON Notification provider statistics </h1>

    <div className = "page-chart-block">
      <h2>Messages delivered (last hour)</h2>
      <div className = "page-chart">
        {stat && <FlexibleXYPlot xType="time" color = "#ff2400" animation margin = {{left: 35, right: 35, top: 15, bottom: 60}}>
          <XAxis
            tickPadding = { 25 }
            style = {{
              fontFamily: "Roboto",
              fontSize: "12px",
              fontStyle: "normal",
              fontWeight: "500" as any,
              fill: "#A5A5A5",
              stroke: "none"
            }}
          />
          <YAxis style = {{
            fontFamily: "Roboto",
            fontSize: "12px",
            fontStyle: "normal",
            fontWeight: "500" as any,
            fill: "#A5A5A5",
            stroke: "none"
          }}/>

          <LineSeries
              color = "var(--main-primary-color)"
              /*markStyle={{fill: "var(--main-primary-color)", stroke: "white", strokeWidth: "2"}}*/
              style = {{fill: "none", strokeWidth: "1"}}
              data = { stat.messages_delivered.map((y: number, x: number) => { return { x: new Date(stat.x[x] * 1000), y }})}
          />
        </FlexibleXYPlot>}
      </div>
    </div>    

    <div className = "page-chart-block">
      <h2>Messages delivered (last 24 hours)</h2>
      <div className = "page-chart">
        {stat2 && <FlexibleXYPlot xType="time" color = "#ff2400" animation margin = {{left: 35, right: 35, top: 15, bottom: 60}}>
          <XAxis
            tickPadding = { 25 }
            style = {{
              fontFamily: "Roboto",
              fontSize: "12px",
              fontStyle: "normal",
              fontWeight: "500" as any,
              fill: "#A5A5A5",
              stroke: "none"
            }}
          />
          <YAxis style = {{
            fontFamily: "Roboto",
            fontSize: "12px",
            fontStyle: "normal",
            fontWeight: "500" as any,
            fill: "#A5A5A5",
            stroke: "none"
          }}/>

          <LineSeries
              color = "var(--main-primary-color)"
              /*markStyle={{fill: "var(--main-primary-color)", stroke: "white", strokeWidth: "2"}}*/
              style = {{fill: "none", strokeWidth: "1"}}
              data = { stat2.messages_delivered.map((y: number, x: number) => { return { x: new Date(stat2.x[x] * 1000), y }})}
          />
        </FlexibleXYPlot>}
      </div>
    </div>

  </div>
}

export { PageStat }
