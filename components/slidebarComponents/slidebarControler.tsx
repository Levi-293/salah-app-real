import React from 'react';
import { Text } from 'react-native';
import { useGlobalContext } from '../../context/GlobalProvider';
import SlideBar from './slidebar';
import ActiveTimingNotification from './activeTimingNotification';
import Other from './Other';
import Theme from './Theme';
import Notifications from './Notifications';
import PrayerTimes from './PrayerTimes';
import ReportIssue from './ReportIssue';
import PrivacyPolicy from './PrivacyPolicy';
import FAQ from './FAQ';
import ThanksReport from './ThanksReport';
import RequestFeature from './RequestFeature';
import CustomAdjustments from './CustomAdjustments';
import LocationNotAlowed from './LocationNotAlowed';
import SupportUs from './SupportUs';
import QiblaTooltip from './QiblaTooltip';
export default function SlidebarControler() {
  const { slidebarActive, slidebarSelected } = useGlobalContext();

  const renderContent = () => {
    switch (slidebarSelected) {
      case 'Prayer Times':
        return <PrayerTimes />;
      case 'Notifications':
        return <Notifications />;
      case 'Themes':
        return <Theme />;
      case 'Other':
        return <Other />;
      case 'Timing':
        return <ActiveTimingNotification />;
      case 'FAQs & Feedback':
        return <FAQ />;
      case 'Report Issue':
        return <ReportIssue />;
      case 'Request Feature':
        return <RequestFeature />;
      case 'Privacy Policy':
        return <PrivacyPolicy />;
      case 'ThanksReport':
        return <ThanksReport />;
      case 'ThanksFeature':
        return <ThanksReport />;
      case 'Calculation Method':
        return <CustomAdjustments />;
      case 'locationNotAllowed':
        return <LocationNotAlowed />;
      case 'Support Us':
        return <SupportUs />;
      case 'Qibla Tooltip':
        return <QiblaTooltip />;
      default:
        return <Text>test aa</Text>;
    }
  };

  return (
    <SlideBar status={slidebarActive}>
      {renderContent()}
    </SlideBar>
  );
}