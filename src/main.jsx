import React from 'react'
import { createRoot } from 'react-dom/client'
<HashRouter>
  <App />
</HashRouter>
import App from './App'
import './styles.css'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>
)
