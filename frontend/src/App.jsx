import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import GameSelection from './pages/GameSelection';
import MathGame from './pages/MathGame';
import LogicPuzzleGame from './pages/LogicPuzzleGame';
import KnowledgeQuiz from './pages/KnowledgeQuiz';
import PythonAdventure from './pages/PythonAdventure';
import PythonLevel from './pages/PythonLevel';
import SkillTree from './pages/SkillTree';
import Leaderboard from './pages/Leaderboard';
import { useAuth } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Admin Pages
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminGames from './pages/admin/AdminGames';
import AdminQuizzes from './pages/admin/AdminQuizzes';
import AdminPythonLevels from './pages/admin/AdminPythonLevels';
import AdminMathProblems from './pages/admin/AdminMathProblems';
import AdminLogicPuzzles from './pages/admin/AdminLogicPuzzles';
import AdminGenericContent from './pages/admin/AdminGenericContent';
import AdminAchievements from './pages/admin/AdminAchievements';
import AdminLeaderboard from './pages/admin/AdminLeaderboard';
import AdminActivity from './pages/admin/AdminActivity';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  return user ? (children ? children : <Outlet />) : <Navigate to="/login" />;
};

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading Auth...</div>;
  if (!user || (user.role !== 'admin' && user.role !== 'moderator')) {
    return <Navigate to="/" />;
  }
  return <AdminLayout>{children}</AdminLayout>;
};

function App() {
  return (
    <Router>
      <div className="app">
        <ToastContainer position="top-right" autoClose={3000} theme="colored" />
        <Routes>
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
          <Route path="/admin/games" element={<AdminRoute><AdminGames /></AdminRoute>} />
          <Route path="/admin/quizzes" element={<AdminRoute><AdminQuizzes /></AdminRoute>} />
          <Route path="/admin/python-levels" element={<AdminRoute><AdminPythonLevels /></AdminRoute>} />
          <Route path="/admin/math-problems" element={<AdminRoute><AdminMathProblems /></AdminRoute>} />
          <Route path="/admin/logic-puzzles" element={<AdminRoute><AdminLogicPuzzles /></AdminRoute>} />
          <Route path="/admin/game-content/:gameId" element={<AdminRoute><AdminGenericContent /></AdminRoute>} />
          <Route path="/admin/achievements" element={<AdminRoute><AdminAchievements /></AdminRoute>} />
          <Route path="/admin/leaderboard" element={<AdminRoute><AdminLeaderboard /></AdminRoute>} />
          <Route path="/admin/activity" element={<AdminRoute><AdminActivity /></AdminRoute>} />

          {/* User Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={
              <>
                <Navbar />
                <main className="main-content">
                  <Dashboard />
                </main>
              </>
            } />
            <Route path="/games" element={
              <>
                <Navbar />
                <main className="main-content">
                  <GameSelection />
                </main>
              </>
            } />
            <Route path="/games/math" element={
              <>
                <Navbar />
                <main className="main-content">
                  <MathGame />
                </main>
              </>
            } />
            <Route path="/games/logic" element={
              <>
                <Navbar />
                <main className="main-content">
                  <LogicPuzzleGame />
                </main>
              </>
            } />
            <Route path="/games/python" element={
              <>
                <Navbar />
                <main className="main-content">
                  <PythonAdventure />
                </main>
              </>
            } />
            <Route path="/games/python/level/:levelId" element={<PythonLevel />} />
            <Route path="/skill-tree" element={
              <>
                <Navbar />
                <main className="main-content">
                  <SkillTree />
                </main>
              </>
            } />
            <Route path="/games/quiz" element={
              <>
                <Navbar />
                <main className="main-content">
                  <KnowledgeQuiz />
                </main>
              </>
            } />
            <Route path="/leaderboard" element={
              <>
                <Navbar />
                <main className="main-content">
                  <Leaderboard />
                </main>
              </>
            } />
          </Route>

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
