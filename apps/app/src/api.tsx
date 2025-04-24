import { createClient } from "@superstreamer/api/client";
import type { ApiClient } from "@superstreamer/api/client";
import { createContext, useContext, useMemo } from "react";
import type { ReactNode } from "react";
import { useAuth } from "./auth";

export interface ApiContext {
  api: ApiClient;
}

const ApiContext = createContext<ApiContext | null>(null);

interface ApiProviderProps {
  children: ReactNode;
}

export function ApiProvider({ children }: ApiProviderProps) {
  const { token } = useAuth();

  const api = useMemo(
    () => createClient(window.__ENV__.PUBLIC_API_ENDPOINT, token),
    [token],
  );

  return <ApiContext.Provider value={{ api }}>{children}</ApiContext.Provider>;
}

export function useApi() {
  const context = useContext(ApiContext);
  if (!context) {
    throw new Error("useApi must be used within an ApiProvider");
  }
  return context;
}
