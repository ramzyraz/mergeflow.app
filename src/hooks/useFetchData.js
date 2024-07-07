import useSWR from 'swr';

// Custom hook to fetch data using SWR
export function useFetchData(url, fetchFunction) {
  const { data, error, mutate } = useSWR(url, fetchFunction);

  const isLoading = !data && !error;
  const isError = error;

  return {
    data,
    isLoading,
    isError,
    mutate
  };
}
