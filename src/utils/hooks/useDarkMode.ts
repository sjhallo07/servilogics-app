import type { Mode } from '../../@types/theme'
import { THEME_ENUM } from '../../constants/theme.constant'
import { useThemeStore } from '../../store/themeStore'
import { useEffect } from 'react'

function useDarkMode(): [
    isEnabled: boolean,
    onModeChange: (mode: Mode) => void,
]
{
    const mode = useThemeStore((state) => state.mode)
    const setMode = useThemeStore((state) => state.setMode)

    const { MODE_DARK, MODE_LIGHT, MODE_SYSTEM } = THEME_ENUM

    // Determine the effective mode to apply (light/dark) considering 'system'
    const prefersDark = typeof window !== 'undefined'
        ? window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
        : false

    const appliedMode = mode === MODE_SYSTEM
        ? (prefersDark ? MODE_DARK : MODE_LIGHT)
        : mode

    const isEnabled = appliedMode === MODE_DARK

    const onModeChange = (nextMode: Mode) =>
    {
        setMode(nextMode)
    }

    // Apply class to <html> based on applied mode
    useEffect(() =>
    {
        if (typeof window === 'undefined') {
            return
        }
        const root = window.document.documentElement
        root.classList.remove(isEnabled ? MODE_LIGHT : MODE_DARK)
        root.classList.add(isEnabled ? MODE_DARK : MODE_LIGHT)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isEnabled])

    // When in 'system' mode, respond to OS theme changes
    useEffect(() =>
    {
        if (typeof window === 'undefined') {
            return
        }
        if (mode !== MODE_SYSTEM) {
            return
        }
        const media = window.matchMedia('(prefers-color-scheme: dark)')
        const handleChange = (e: MediaQueryListEvent) =>
        {
            const root = window.document.documentElement
            if (e.matches) {
                root.classList.remove(MODE_LIGHT)
                root.classList.add(MODE_DARK)
            } else {
                root.classList.remove(MODE_DARK)
                root.classList.add(MODE_LIGHT)
            }
        }
        media.addEventListener?.('change', handleChange)
        return () => media.removeEventListener?.('change', handleChange)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mode])

    return [isEnabled, onModeChange]
}

export default useDarkMode
