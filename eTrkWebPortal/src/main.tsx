import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { HashRouter } from "react-router-dom";
import { UserDataRangeProvider } from "./components/contexts/user-data-context/index.tsx";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthProvider } from "./components/contexts/authguard-context/Index.tsx";
import { ClaimsProvider } from "./components/contexts/range-context/index.tsx";
ReactDOM.createRoot(document.getElementById("root")!).render(
  <HashRouter>
    <AuthProvider>
      <ClaimsProvider>
        <UserDataRangeProvider>
          <App />
          <ToastContainer />
        </UserDataRangeProvider>
      </ClaimsProvider>
    </AuthProvider>
  </HashRouter>
);
