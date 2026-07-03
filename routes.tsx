import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './screens/Dashboard';
import CampaignsList from './screens/CampaignsList';
import CampaignTypePicker from './screens/CampaignTypePicker';
import CampaignBuilder from './screens/CampaignBuilder';
import ApprovalInbox from './screens/ApprovalInbox';
import ApprovalDetail from './screens/ApprovalDetail';
import SafetyOps from './screens/SafetyOps';
import Loyalty from './screens/Loyalty';
import ProgramBuilder from './screens/ProgramBuilder';
import Players from './screens/Players';
import PlayerProfile from './screens/PlayerProfile';
import Rewards from './screens/Rewards';
import RewardDetail from './screens/RewardDetail';
import Segments from './screens/Segments';
import Integrations from './screens/Integrations';
import IntegrationSetup from './screens/IntegrationSetup';
import BrandsOrg from './screens/BrandsOrg';
import Monitoring from './screens/Monitoring';
import CampaignDetail from './screens/CampaignDetail';
import Settings from './screens/Settings';
import AuthFlow from './screens/AuthFlow';
import CampaignOps from './screens/CampaignOps';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<AuthFlow mode="login" />} />
      <Route path="/signup" element={<AuthFlow mode="signup" />} />
      <Route path="/invite" element={<AuthFlow mode="invite" />} />
      <Route path="/forgot-password" element={<AuthFlow mode="forgot" />} />
      <Route path="/2fa" element={<AuthFlow mode="2fa" />} />
      <Route path="/select-org" element={<AuthFlow mode="select-org" />} />
      <Route path="/" element={<Layout><CampaignsList /></Layout>} />
      <Route path="/ops" element={<Layout><CampaignOps /></Layout>} />
      <Route path="/campaigns/:id" element={<Layout><CampaignDetail /></Layout>} />
      <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
      <Route path="/create" element={<Layout><CampaignTypePicker /></Layout>} />
      <Route path="/builder/:step" element={<Layout><CampaignBuilder /></Layout>} />
      <Route path="/loyalty" element={<Layout><Loyalty /></Layout>} />
      <Route path="/loyalty/builder/:step" element={<Layout><ProgramBuilder /></Layout>} />
      <Route path="/rewards" element={<Layout><Rewards /></Layout>} />
      <Route path="/rewards/:id" element={<Layout><RewardDetail /></Layout>} />
      <Route path="/players" element={<Layout><Players /></Layout>} />
      <Route path="/players/:id" element={<Layout><PlayerProfile /></Layout>} />
      <Route path="/segments" element={<Layout><Segments /></Layout>} />
      <Route path="/monitoring" element={<Layout><Monitoring /></Layout>} />
      <Route path="/integrations" element={<Layout><Integrations /></Layout>} />
      <Route path="/integrations/setup" element={<Layout><IntegrationSetup /></Layout>} />
      <Route path="/org" element={<Layout><BrandsOrg /></Layout>} />
      <Route path="/safety" element={<Layout><SafetyOps /></Layout>} />
      <Route path="/approvals" element={<Layout><ApprovalInbox /></Layout>} />
      <Route path="/approvals/:id" element={<Layout><ApprovalDetail /></Layout>} />
      <Route path="/settings" element={<Layout><Settings /></Layout>} />
    </Routes>
  );
}
