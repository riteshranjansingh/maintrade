import React from 'react'
import ReactDOM from 'react-dom/client'

// Basic App component
const App = () => {
  return (
    <div style={{ padding: '20px' }}>
      <h1>MainTrade</h1>
      <p>Basic setup test</p>
    </div>
  )
}

// Mount React app
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)