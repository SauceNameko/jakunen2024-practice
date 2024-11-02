import { useEffect, useRef, useState } from "react"
import { GetField } from "../api/GetField";
import { fieldObjects } from "../fieldObjects";
export const useField = (isStart) => {
    const [field, setField] = useState([]);
    const [copyField, setCopyField] = useState([]);
    const [playerPos, setPlayerPos] = useState({ y: 1, x: 1 });
    const [count, setCount] = useState(0);
    const [moveData, setMoveData] = useState(fieldObjects.kawa);
    const [score, setScore] = useState(0);
    const [isGameOver, setIsGameOver] = useState(false);
    const [isMuteki, setIsMuteki] = useState(false);
    const [time, setTime] = useState(0);
    const getField = async () => {
        const data = await GetField();
        setCopyField(structuredClone(data));
        for (let i = 0; i < data.length; i++) {
            for (let j = 0; j < data[i].length; j++) {
                if (i == 1 && j == 1) {
                    data[i][j] = 4;
                    setField(data);
                }
            }
        }
    }
    useEffect(() => {
        getField();
    }, []);


    //スタートボタンを押したら動作
    useEffect(() => {
        if (isStart) {
            setInterval(() => {
                setTime(prev => prev + 1);
                setCount(prev => (prev == copyField.length - 1 ? 1 : prev + 1));
            }, 1000);
        }
    }, [isStart]);

    const handleKeyDown = (e) => {
        switch (e.key) {
            case "ArrowLeft":
                move("left")
                break;
            case "ArrowRight":
                move("right");
                break;
            default:
                break;
        }
    }

    const move = (direction) => {
        setPlayerPos(prev => {
            let newY = prev.y;
            let newX = prev.x;
            switch (direction) {
                case "left":
                    newX = newX - 1;
                    break;
                case "right":
                    newX = newX + 1;
                    break;
                case "down":
                    newY = newY + 1;
                    break;
                default:
                    break;
            }
            const newField = [...field];
            if (newField[newY][newX] == null) {
                return { y: prev.y, x: prev.x };
            } else if (direction == "down") {
                setMoveData(newField[newY][newX]);
                newField[prev.y][prev.x] = fieldObjects.kawa;
                newField[newY][newX] = fieldObjects.player;
                newField.shift();
                newField.push(copyField[count]);
                setField(newField);
                return { y: prev.y, x: prev.x };
            } else {
                setMoveData(newField[newY][newX]);
                newField[newY][newX] = fieldObjects.player;
                newField[prev.y][prev.x] = fieldObjects.kawa;
                setField(newField);
                return { y: newY, x: newX };
            }
        });
    }

    useEffect(() => {
        if (isStart) {
            document.addEventListener("keydown", handleKeyDown);
            return () => {
                document.removeEventListener("keydown", handleKeyDown);
            }
        }
    }, [isStart, field]);

    useEffect(() => {
        if (field.length === 0) return;
        move("down");
    }, [time]);

    useEffect(() => {
        if (moveData == fieldObjects.score) {
            setScore(prev => prev + 100);
        } else if (moveData == fieldObjects.muteki) {
            setIsMuteki(true);
        } else if (moveData == fieldObjects.syougai) {
            if (!isMuteki) {
                setIsGameOver(true);
            } else {
                setIsMuteki(false);
            }
        }
    }, [playerPos]);

    return { field };
}