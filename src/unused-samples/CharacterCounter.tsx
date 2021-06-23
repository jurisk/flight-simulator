import {
    atom,
    selector,
    useRecoilState,
    useRecoilValue,
} from "recoil"
import React, {ChangeEvent} from "react"

const textState = atom({
    key: "textState", // unique ID (with respect to other atoms/selectors)
    default: "", // default value (aka initial value)
})

const charCountState = selector({
    key: "charCountState", // unique ID (with respect to other atoms/selectors)
    get: ({get}) => {
        const text = get(textState)

        return text.length
    },
})

function CharacterCount() {
    const count = useRecoilValue(charCountState)

    return <>Character Count: {count}</>
}

export function CharacterCounter(): JSX.Element {
    return (
        <div>
            <TextInput />
            <CharacterCount />
        </div>
    )
}

function TextInput() {
    const [text, setText] = useRecoilState(textState)

    const onChange = (event: ChangeEvent<HTMLInputElement>) => {
        setText(event.target.value)
    }

    return (
        <div>
            <input type="text" value={text} onChange={onChange} />
            <br />
            Echo: {text}
        </div>
    )
}
