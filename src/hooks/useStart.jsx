import { useEffect, useState } from "react"

export const useStart = () => {
    const [isStart, setIsStart] = useState(false);
    const toggleSpace = (e) => {
        switch (e.key) {
            case " ":
                setIsStart(prev => !prev);
                break;

            default:
                break;
        }
    }
    useEffect(() => {
        document.addEventListener("keydown", toggleSpace);
        return () => {
            document.removeEventListener("keydown", toggleSpace);
        }
    }, []);
    return { isStart };
}