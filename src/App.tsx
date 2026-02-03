import { BrowserRouter } from "react-router-dom";
import { AppRoutes } from "./router";
import { I18nextProvider } from "react-i18next";
import i18n from "./i18n";
import { AuthProvider } from "./contexts/AuthContext";
import { OrganizationProvider } from "./contexts/OrganizationContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <I18nextProvider i18n={i18n}>
        <AuthProvider>
          <OrganizationProvider>
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
          </OrganizationProvider>
        </AuthProvider>
      </I18nextProvider>
    </QueryClientProvider>
  );
}

export default App;
