import { ThemeModeSet } from '@/@types/theme'
import Dropdown from '@/components/ui/Dropdown'
import { useThemeStore } from '@/store/themeStore'
import type { ReactNode } from 'react'
import { PiDesktopDuotone, PiMoonDuotone, PiSunDuotone } from 'react-icons/pi'

const modeLabel: Record<typeof ThemeModeSet[number], string> = {
    light: 'Light',
    dark: 'Dark',
    system: 'System',
}

const modeIcon: Record<typeof ThemeModeSet[number], ReactNode> = {
    light: <PiSunDuotone className="w-5 h-5 text-gray-500" />,
    dark: <PiMoonDuotone className="w-5 h-5 text-gray-500" />,
    system: <PiDesktopDuotone className="w-5 h-5 text-gray-500" />,
}

const ThemeModeSelector = () => {
    const currentMode = useThemeStore((s) => s.mode)
    const setMode = useThemeStore((s) => s.setMode)

    return (
        <Dropdown
            renderTitle={
                <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                    {modeIcon[currentMode]}
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {modeLabel[currentMode]}
                    </span>
                </button>
            }
        >
            {ThemeModeSet.map((m) => (
                <Dropdown.Item
                    key={m}
                    eventKey={m}
                    active={currentMode === m}
                    onSelect={() => setMode(m)}
                >
                    <div className="flex items-center gap-2">
                        {modeIcon[m]}
                        <span>{modeLabel[m]}</span>
                    </div>
                </Dropdown.Item>
            ))}
        </Dropdown>
    )
}

export default ThemeModeSelector
