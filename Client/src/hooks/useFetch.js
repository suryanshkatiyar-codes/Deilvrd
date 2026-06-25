import { useState, useEffect, useCallback } from "react";
import api from "../api/axios";

export default function useFetch(url) {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  const fetchData = useCallback(function() {
    if (!url) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    api.get(url)
      .then(function(res) {
        setData(res.data);
      })
      .catch(function(err) {
        const msg = err.response && err.response.data && err.response.data.message
          ? err.response.data.message
          : "Something went wrong";
        setError(msg);
      })
      .finally(function() {
        setLoading(false);
      });
  }, [url]);

  useEffect(function() {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}