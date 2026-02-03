/**
 * © 2024 Cyber Execution Line. All Rights Reserved.
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 * Proprietary and confidential.
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// 初始化平台适配层（已禁用返回按钮功能）
// setTimeout(() => {
//   import('./platform').then(({ initPlatform }) => {
//     initPlatform();
//   }).catch(err => {
//     console.error('[Platform] 初始化失败:', err);
//   });
// }, 0);

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);