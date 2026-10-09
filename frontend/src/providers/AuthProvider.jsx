import { AuthProvider } from "@/context/AuthContext";

export default function AppAuthProvider({ children }) {
  return <AuthProvider>{children}</AuthProvider>;
}
