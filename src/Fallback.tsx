import React, {useRef} from "react"
import {Nullable} from "@babylonjs/core/types"
import {Mesh} from "@babylonjs/core/Meshes/mesh"
import {useBeforeRender} from "react-babylonjs"

export const Fallback: () => JSX.Element = () => {
    const boxRef = useRef<Nullable<Mesh>>()

    useBeforeRender((scene) => {
        if (boxRef.current) {
            const deltaTimeInMillis = scene.getEngine().getDeltaTime()

            const rpm = 10
            const box = boxRef.current
            if (box) {
                box.rotation.x = Math.PI / 4
                box.rotation.y += ((rpm / 60) * Math.PI * 2 * (deltaTimeInMillis / 1000))
            }
        }
    })

    return <box ref={boxRef} name='fallback' size={2} />
}
