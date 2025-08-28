import { RouterProvider } from "react-router";
import { AuthProvider } from "app/contexts/auth/Provider";
import { BreakpointProvider } from "app/contexts/breakpoint/Provider";
import { LocaleProvider } from "app/contexts/locale/Provider";
import { SidebarProvider } from "app/contexts/sidebar/Provider";
import { ThemeProvider } from "app/contexts/theme/Provider";
import router from "app/router/router";
import {Provider} from "react-redux";
import {store} from "./store/index.js";

function App() {
  return (
      <Provider store={store}>
        <AuthProvider>
          <ThemeProvider>
            <LocaleProvider>
              <BreakpointProvider>
                <SidebarProvider>
                  <RouterProvider router={router} />
                </SidebarProvider>
              </BreakpointProvider>
            </LocaleProvider>
          </ThemeProvider>
        </AuthProvider>
      </Provider>
  );
}

export default App;