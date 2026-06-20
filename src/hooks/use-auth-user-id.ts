import { useEffect, useState } from "react";
import { watchAuthUser } from "@/services/auth-service";

export function useAuthUserId() {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    try {
      const unsubscribe = watchAuthUser((user) => {
        if (mounted) {
          setUserId(user?.uid ?? null);
        }
      });

      return () => {
        mounted = false;
        unsubscribe();
      };
    } catch {
      void Promise.resolve().then(() => {
        if (mounted) {
          setUserId(null);
        }
      });

      return () => {
        mounted = false;
      };
    }
  }, []);

  return userId;
}
