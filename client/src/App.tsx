import { Switch, Route, useLocation } from "wouter";
import React, { lazy, Suspense } from "react"; 
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Layout from "./components/Layout";
import AdminLayout from "./components/AdminLayout";
import { UploadProgress } from "./components/UploadProgress";

// Pages
import Home from "./pages/Home";
import VideoPage from "./pages/VideoPage";
import ChannelPage from "./pages/ChannelPage";
import UploadPage from "./pages/UploadPage";
import SubscriptionsPage from "./pages/SubscriptionsPage";
import HistoryPage from "./pages/HistoryPage";
import SettingsPage from "./pages/SettingsPage";
import ExplorePage from "./pages/ExplorePage";
import LibraryPage from "./pages/LibraryPage";
import LikedVideosPage from "./pages/LikedVideosPage";
import WatchLaterPage from "./pages/WatchLaterPage";
import TrashPage from './pages/TrashPage';
import HelpPage from "./pages/HelpPage";
import FeedbackPage from "./pages/FeedbackPage";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import { AuthProvider } from "@/hooks/use-auth";
import { UploadProvider } from "@/hooks/use-upload";
import { ProtectedRoute, AdminProtectedRoute } from "@/lib/protected-route";
import PlaylistPage from './pages/PlaylistPage';
import VideoStatsPage from './pages/VideoStatsPage';
import MonetizationPage from './pages/MonetizationPage';
import SearchPage from './pages/SearchPage';

// Admin pages
import AdminDashboard from "./pages/admin/Dashboard";
import AdminLogin from "./pages/admin/Login";
import AdminVideos from "./pages/admin/Videos";
import AdminUsers from "./pages/admin/Users";
import AdminSettings from "./pages/admin/Settings";
import AdminComments from "./pages/admin/Comments";
import AdminAnalytics from "./pages/admin/Analytics";
import AdminNotifications from "./pages/admin/Notifications";
import AdminHelp from "./pages/admin/Help";

// Ad Network Pages
import AdNetworkLogin from './pages/adnetwork/Login';
import Advertising from './pages/adnetwork/Advertising';
import { AdNetworkProtectedRoute } from "./lib/ad-network-route";
import EditVideoPage from "./pages/EditVideoPage";

function Router() {
  const [location] = useLocation();

  // Check if the current path is an admin route
  const isAdminRoute = location.startsWith('/admin');

  if (isAdminRoute) {
    if (location === '/admin/login') {
      return (
        <Switch>
          <Route path="/admin/login" component={AdminLogin} />
        </Switch>
      );
    }

    return (
      <AdminLayout>
        <Switch>
          <AdminProtectedRoute path="/admin" component={AdminDashboard} />
          <AdminProtectedRoute path="/admin/videos" component={AdminVideos} />
          <AdminProtectedRoute path="/admin/users" component={AdminUsers} />
          <AdminProtectedRoute path="/admin/settings" component={AdminSettings} />
          <AdminProtectedRoute path="/admin/comments" component={AdminComments} />
          <AdminProtectedRoute path="/admin/analytics" component={AdminAnalytics} />
          <AdminProtectedRoute path="/admin/notifications" component={AdminNotifications} />
          <AdminProtectedRoute path="/admin/help" component={AdminHelp} />
          <Route component={NotFound} />
        </Switch>
      </AdminLayout>
    );
  }

  if (location === '/auth' || location.startsWith('/adnetwork')) {
    return (
      <Switch>
        <Route path="/auth" component={AuthPage} />
        <Route path="/adnetwork/login" component={AdNetworkLogin} />
        <AdNetworkProtectedRoute path="/adnetwork" component={Advertising} />
      </Switch>
    );
  }

  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/search" component={SearchPage} />
        <Route path="/watch" component={VideoPage} />
        <Route path="/channel/:username" component={ChannelPage} />
        <Route path="/explore" component={ExplorePage} />
        <ProtectedRoute path="/upload" component={UploadPage} />
        <ProtectedRoute path="/subscriptions" component={SubscriptionsPage} />
        <ProtectedRoute path="/history" component={HistoryPage} />
        <ProtectedRoute path="/library" component={LibraryPage} />
        <ProtectedRoute path="/liked-videos" component={LikedVideosPage} />
        <ProtectedRoute path="/watch-later" component={WatchLaterPage} />
        <Route path="/trash" component={TrashPage} />
        <ProtectedRoute path="/settings" component={SettingsPage} />
        <Route path="/help" component={HelpPage} />
        <Route path="/help/account" component={() => (
          <Suspense fallback={<div>Loading...</div>}>
            {React.createElement(lazy(() => import('./pages/help/Account')))}
          </Suspense>
        )} />
        <Route path="/help/navigation" component={() => (
          <Suspense fallback={<div>Loading...</div>}>
            {React.createElement(lazy(() => import('./pages/help/Navigation')))}
          </Suspense>
        )} />
        <Route path="/help/watching" component={() => (
          <Suspense fallback={<div>Loading...</div>}>
            {React.createElement(lazy(() => import('./pages/help/Watching')))}
          </Suspense>
        )} />
        <Route path="/help/engagement" component={() => (
          <Suspense fallback={<div>Loading...</div>}>
            {React.createElement(lazy(() => import('./pages/help/Engagement')))}
          </Suspense>
        )} />
        <Route path="/help/profile" component={() => (
          <Suspense fallback={<div>Loading...</div>}>
            {React.createElement(lazy(() => import('./pages/help/Profile')))}
          </Suspense>
        )} />
        <Route path="/help/privacy" component={() => (
          <Suspense fallback={<div>Loading...</div>}>
            {React.createElement(lazy(() => import('./pages/help/Privacy')))}
          </Suspense>
        )} />
        <Route path="/help/notifications" component={() => (
          <Suspense fallback={<div>Loading...</div>}>
            {React.createElement(lazy(() => import('./pages/help/Notifications')))}
          </Suspense>
        )} />
        <Route path="/help/deletion" component={() => (
          <Suspense fallback={<div>Loading...</div>}>
            {React.createElement(lazy(() => import('./pages/help/Deletion')))}
          </Suspense>
        )} />
        <Route path="/help/content-creation" component={() => (
          <Suspense fallback={<div>Loading...</div>}>
            {React.createElement(lazy(() => import('./pages/help/ContentCreation')))}
          </Suspense>
        )} />
        <Route path="/help/community-guidelines" component={() => (
          <Suspense fallback={<div>Loading...</div>}>
            {React.createElement(lazy(() => import('./pages/help/CommunityGuidelines')))}
          </Suspense>
        )} />
        <Route path="/help/copyright" component={() => (
          <Suspense fallback={<div>Loading...</div>}>
            {React.createElement(lazy(() => import('./pages/help/Copyright')))}
          </Suspense>
        )} />
        <Route path="/help/technical-support" component={() => (
          <Suspense fallback={<div>Loading...</div>}>
            {React.createElement(lazy(() => import('./pages/help/TechnicalSupport')))}
          </Suspense>
        )} />
        <Route path="/feedback" component={FeedbackPage} />
        <Route path="/playlists" component={PlaylistPage} />
        <Route path="/video-stats" component={VideoStatsPage} />
        <Route path="/monetization" component={MonetizationPage} />
        <Route path="/channel/:username/videos" component={ChannelPage} />
        <Route path="/edit-video/:id" component={EditVideoPage} />
        <Route path="/not-found" component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <UploadProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
            <UploadProgress />
          </TooltipProvider>
        </UploadProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;