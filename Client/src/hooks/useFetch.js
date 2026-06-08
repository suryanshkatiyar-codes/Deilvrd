import { useState, useEffect, useCallback } from "react";
import api from "../api/axios";

export default function useFetch(url) {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  const fetch = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get(url);
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, error, refetch: fetch };
}