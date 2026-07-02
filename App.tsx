import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes';
import { CampaignProvider } from './context/CampaignContext';
import { ReviewsProvider } from './context/ReviewsContext';
import { ProgramProvider } from './context/ProgramContext';
import './index.css';

export default function App() {
  return (
    <CampaignProvider>
      <ReviewsProvider>
        <ProgramProvider>
          <BrowserRouter basename={import.meta.env.BASE_URL}>
            <AppRoutes />
          </BrowserRouter>
        </ProgramProvider>
      </ReviewsProvider>
    </CampaignProvider>
  );
}
