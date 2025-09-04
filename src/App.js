import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import WelcomePage from "./pages/WelcomePage";
import SurveyPage from "./pages/SurveyPage";
import ResultsPage from "./pages/ResultsPage";
import "./index.css";

function App() {
  return (
    <Router>
    <Routes>
      <Route path="/" element={<WelcomePage />} />
      <Route path="/survey" element={<SurveyPage />} />
      <Route path="/results" element={<ResultsPage />} />
    </Routes>
  </Router>
  );
}

export default App;
