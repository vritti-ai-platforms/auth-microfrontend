import '@vritti/quantum-ui/index.css';
import { configureQuantumUI } from '@vritti/quantum-ui';
import ReactDOM from 'react-dom/client';
import quantumUIConfig from '../quantum-ui.config';
import App from './App';
import './index.css';

// Initialize quantum-ui configuration
configureQuantumUI(quantumUIConfig);

const rootEl = document.getElementById('root');
if (rootEl) {
  const root = ReactDOM.createRoot(rootEl);
  root.render(<App />);
}
