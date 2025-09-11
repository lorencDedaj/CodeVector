import { createBrowserRouter } from 'react-router-dom';
import Upload from './pages/Upload';
import Chat from './pages/Chat'; 

export const router = createBrowserRouter([
  { path: '/', element: <Upload /> },
  { path: '/chat/:projectId', element: <Chat /> },
]);
