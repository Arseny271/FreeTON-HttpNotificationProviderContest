import React, { useRef } from "react";
import QRCode from "react-qr-code";
import { Icon } from "../informs/icon"
import "./qrcode-container.css"

interface QrCodeContainerProps {
  value: string;
  size: number;
  downloadable?: boolean;
}

const QrCodeContainer: React.FunctionComponent<QrCodeContainerProps> = (props) => {
  const qrCodeRef = useRef<any>(null);
  const startDownload = () => {
    if (qrCodeRef.current === null) return;

    const svgEls = qrCodeRef.current.getElementsByTagName("svg");
    if (svgEls.length === 0) return;

    const svg = svgEls[0];
    const svgCode = svg.outerHTML;
    const urlData = URL.createObjectURL(new Blob([svgCode], {type: 'image/svg+xml'}));

    const svgImage = document.createElement('img');
    svgImage.style.position = 'absolute';
    svgImage.style.top = '-9999px';
    document.body.appendChild(svgImage);
    svgImage.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 512; canvas.height = 512;
      const canvasCtx = canvas.getContext('2d');
      if (canvasCtx !== null) {
        canvasCtx.drawImage(svgImage, 0, 0, svgImage.clientWidth, svgImage.clientHeight, 0, 0, 512, 512);
        const imgData = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = 'qr-code.png';
        link.href = imgData;
        link.click();
      }
      document.body.removeChild(svgImage);
    }

    svgImage.src = urlData;



    console.log("startDownload");
    console.log(qrCodeRef, urlData);
  }

  return <div  ref = {qrCodeRef} className = {`qr-code-container ${props.downloadable?"downloadable":""}`} style = {{width: props.size+"px", height: props.size+"px"}}>
    <QRCode value = {props.value} size = {props.size * 10}/>
    <Icon iconColor = "var(--color-1e-gray)" iconSize = "45%" url = "/icons/download.svg" onClick = {startDownload}/>
  </div>
}

export { QrCodeContainer }
