import React from "react";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "sonner";

import AppRoutes from "./routes/AppRoutes";

const App = () => {
  return (
    <BrowserRouter>

      <AppRoutes />

      <Toaster
        position="top-center"
        richColors
        closeButton
      />

    </BrowserRouter>
  );
};

export default App;