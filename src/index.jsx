import { createRoot } from 'react-dom/client';
import { HashRouter } from "react-router-dom";
import App from './App.jsx';

import './localization/index.js';

const container = document.getElementById('root');
const root = createRoot(container);
root.render(
    <HashRouter>
        <App />
    </HashRouter>,
);