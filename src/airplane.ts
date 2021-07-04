import {Controls} from "./controls"
import {
    AbstractMesh,
    ActionManager,
    ArcRotateCamera,
    AssetsManager,
    ExecuteCodeAction,
    Scene,
    Vector3
} from "@babylonjs/core"
import {loadMesh} from "./loading"

export function loadAirplane(
    scene: Scene,
    assetsManager: AssetsManager,
    camera: ArcRotateCamera,
    loaded: (mesh: AbstractMesh) => void,
    gameOver: () => void,
): void {
    loadMesh(
        assetsManager,
        "f15 task",
        ["F_15_C", "GLass", "TAnks"],
        "assets/models/f15/",
        "f15.gltf",
        new Vector3(30, 30, 30),
        new Vector3(0, Math.PI * (7/8), 0),
        new Vector3(1, 1, 1),
        (airplane) => {
            airplane.actionManager = new ActionManager(scene)
            airplane.actionManager.registerAction(
                new ExecuteCodeAction(
                    {
                        trigger: ActionManager.OnIntersectionEnterTrigger,
                        parameter: scene.getMeshByName("map"),
                    },
                    () => {
                        console.log("collision")
                        // TODO: unfortunately this crashes with "Uncaught DOMException: Failed to execute 'removeChild' on 'Node': The node to be removed is not a child of this node."
                        gameOver()
                    },
                ),
            )
            const followDirection = new Vector3(0, 0.2, -1)
            const FollowCameraDistance = 20

            camera.position = airplane.position
                .add(airplane.getDirection(followDirection).scale(FollowCameraDistance))

            loaded(airplane)
        },
    )
}

// Ideally, we would take airplane position & rotation and return new position & rotation to make this a
// pure, testable function.
export function updateAirplane(airplane: AbstractMesh, deltaTime: number, controls: Controls): void {
    const rotationAmount = Math.PI * deltaTime * 0.001

    airplane.rotate(new Vector3(0, 0, -1), rotationAmount * controls.roll)

    const RudderFactor = 0.1
    airplane.rotate(new Vector3(0, 1, 0), rotationAmount * RudderFactor * controls.rudder)

    if (controls.pitch < 0) { // we can pitch down worse than we can pitch up
        airplane.rotate(new Vector3(-1, 0, 0), rotationAmount * controls.pitch * 0.05)
    } else if (controls.pitch > 0) {
        airplane.rotate(new Vector3(-1, 0, 0), rotationAmount * controls.pitch * 0.4)
    }

    const forward = new Vector3(0, 0, 1)
    const SpeedFactor = 0.02

    // TODO: throttle isn't really speed, have to decouple and add inertia and stalling
    const direction = airplane
        .getDirection(forward)
        .scale(deltaTime * SpeedFactor * controls.throttle)

    // TODO: move to more advanced physics such as https://www.youtube.com/watch?v=p3jDJ9FtTyM / https://github.com/gasgiant/Aircraft-Physics
    airplane.position.addInPlace(direction)
}
