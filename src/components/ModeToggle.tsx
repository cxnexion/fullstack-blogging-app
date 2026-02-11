import * as React from "react"
import {useState} from "react"
import {Moon, Sun} from "lucide-react"

import {Button} from "@/components/ui/button"

function ModeToggle() {
    const [isDarkMode, setIsDarkMode] = useState(false);

    React.useEffect(() => {
        setIsDarkMode(document.documentElement.classList.contains("dark"))
    }, [])

    React.useEffect(() => {
        document.documentElement.classList[isDarkMode ? "add" : "remove"]("dark")
    }, [isDarkMode])

    const darkModeHandler = () => {
        setIsDarkMode(d => !d);
    }

    return (
        <Button variant="outline" size="icon" onClick={darkModeHandler}>
            <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90"/>
            <Moon
                className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0"/>
            <span className="sr-only">Toggle theme</span>
        </Button>
    )
}

export default ModeToggle