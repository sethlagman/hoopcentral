import { useEffect, useState } from 'react'

/**
 * `key` must change whenever `loader` should run again.
 * The effect uses the loader from the render that changed `key`.
 */
export function useLoad(key, loader) {
  const [tracked, setTracked] = useState(key)
  const [state, setState] = useState({ loading: true, error: null, data: null })
  if (tracked !== key) {
    setTracked(key)
    setState({ loading: true, error: null, data: null })
  }

  useEffect(() => {
    let cancelled = false
    loader()
      .then((data) => {
        if (!cancelled) setState({ loading: false, error: null, data })
      })
      .catch((error) => {
        if (!cancelled) {
          setState({
            loading: false,
            error: error?.message || String(error),
            data: null,
          })
        }
      })
    return () => {
      cancelled = true
    }
    // loader is keyed by `key`; including it would refetch every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  return state
}
