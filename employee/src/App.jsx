import { BrowserRouter, Routes, Route } from 'react-router-dom';
import EmployeeApp from './EmployeeApp';
import ServiceBook from './ServiceBook';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* PUBLIC SERVICE BOOK ROUTE */}
        <Route path="/book/:plate" element={<ServiceBook />} />

        {/* DEFAULT EMPLOYEE APP ROUTE (CATCH ALL) */}
        <Route path="*" element={<EmployeeApp />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;