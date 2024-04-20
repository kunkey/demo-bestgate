import React from 'react'
import ReactDOM from 'react-dom/client'
import { ConfigProvider, theme } from 'antd';
import 'antd/dist/reset.css';

import './index.css';
import App from './App.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ConfigProvider
      theme={{
        "components": {
          "Layout": {
            "bodyBg": "rgb(248, 248, 248)",
            "headerBg": "rgb(250, 173, 20)",
            "headerColor": "rgba(255, 255, 255, 0.88)"
          },
          "Menu": {
            "darkItemBg": "rgb(250, 173, 20)"
          }
        },
        "token": {
          "colorSuccess": "#13c2c2",
          "colorPrimary": "#fa541c",
          "colorInfo": "#fa541c"
        }
      }}
    >
      <App />
    </ConfigProvider>
  </React.StrictMode>,
)
