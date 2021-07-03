import {AbstractMesh} from "@babylonjs/core"
import {Vector3} from "@babylonjs/core/Maths/math.vector"

export function updateUfo(ufo: AbstractMesh, delta: number): void {
    // TODO: move in circles
    const velocity = 0.01
    ufo.position.addInPlace(new Vector3(velocity * delta, 0, velocity * delta))
}
