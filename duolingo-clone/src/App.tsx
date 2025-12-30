import React, { useEffect } from 'react';
import styled, { ThemeProvider } from 'styled-components';
import { GlobalStyles } from './styles/GlobalStyles';
import { theme } from './styles/theme';
import { useAppDispatch, useAppSelector } from './hooks/redux';
import { setIsMobile, setScreenSize } from './store/slices/uiSlice';
import Header from './components/layout/Header/Header';
import AppRoutes from './routes/AppRoutes';
import LoadingSpinner from './components/common/LoadingSpinner';
import NotificationContainer from './components/common/NotificationContainer';
import OfflineIndicator from './components/offline/OfflineIndicator';

const AppContainer = styled.div`
  min-height: 100vh;
  background-color: ${props => props.theme.colors.background};
`;

const MainContent = styled.main`
  padding-top: 70px; /* Header height */
`;

function App() {
  const dispatch = useAppDispatch();
  const { globalLoading } = useAppSelector((state) => state.ui);

  useEffect(() => {
    // Set up responsive design listeners
    const handleResize = () => {
      const width = window.innerWidth;
      const isMobile = width < 768;
      
      dispatch(setIsMobile(isMobile));
      
      if (width < 640) {
        dispatch(setScreenSize('sm'));
      } else if (width < 768) {
        dispatch(setScreenSize('md'));
      } else if (width < 1024) {
        dispatch(setScreenSize('lg'));
      } else {
        dispatch(setScreenSize('xl'));
      }
    };

    // Initial check
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, [dispatch]);

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles />
      <AppContainer>
        <OfflineIndicator />
        <Header />
        <MainContent>
          <AppRoutes />
        </MainContent>
        <NotificationContainer />
        {globalLoading && <LoadingSpinner fullScreen text="加载中..." />}
      </AppContainer>
    </ThemeProvider>
  );
}

export default App;