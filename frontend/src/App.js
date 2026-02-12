import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import Layout from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import ContentCreator from "@/pages/ContentCreator";
import Calendar from "@/pages/Calendar";
import IdeasGenerator from "@/pages/IdeasGenerator";
import Analytics from "@/pages/Analytics";
import GrowthTools from "@/pages/GrowthTools";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="create" element={<ContentCreator />} />
            <Route path="calendar" element={<Calendar />} />
            <Route path="ideas" element={<IdeasGenerator />} />
            <Route path="growth" element={<GrowthTools />} />
            <Route path="analytics" element={<Analytics />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" richColors />
    </div>
  );
}

export default App;
