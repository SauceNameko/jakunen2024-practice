import { path } from "./path"

export const GetField = async () => {
    const res = await fetch(`${path}/fields`, {
        method: "GET",
        headers: { "Content-Type": "application/json" }
    });
    const data = await res.json();
    return data.fields;
}