import React from 'react';

import './index.css';
import StereoVisionTabs from './components/StereoVisionTabs';

const App: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <StereoVisionTabs></StereoVisionTabs>
    </div>
  );
};

export default App;