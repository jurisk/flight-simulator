import {AbstractMesh, GroundMesh, Mesh, Scene, Sound, StandardMaterial, Vector3} from "@babylonjs/core"
import {Color3} from "@babylonjs/core/Maths/math.color"
import {PhysicsImpostor} from "@babylonjs/core/Physics/physicsImpostor"
import {Ufo} from "./ufo"

export function createCannonBall(airplane: AbstractMesh, ufos: readonly Ufo[], ground: GroundMesh, cannonFired: Sound, cannonImpact: Sound, scene: Scene): void {
    const bullet = Mesh.CreateSphere("cannon-ball", 8, 0.1, scene)

    setTimeout(() => {
        bullet.dispose()
    }, 2000)

    const bulletMaterial = new StandardMaterial("cannon-ball-material", scene)
    bulletMaterial.emissiveColor = Color3.Red()
    bullet.material = bulletMaterial

    bullet.position = airplane.getAbsolutePosition()
    bullet.physicsImpostor = new PhysicsImpostor(
        bullet,
        PhysicsImpostor.SphereImpostor,
        { mass: 1, friction: 0.5, restitution: 0.3 },
        scene,
    )

    const dir = airplane.getDirection(new Vector3(0, 0, 1))
    const power = 200
    bullet.physicsImpostor.applyImpulse(dir.scale(power), airplane.getAbsolutePosition())

    bullet.physicsImpostor.onCollideEvent = (object, target) => {
        if (target === ground.physicsImpostor) {
            // TODO: show explosion
            // console.log("collision with ground", ground)
        } else {
            ufos.forEach((ufo) => {
                if (target === ufo.sphere.physicsImpostor) {
                    ufo.bulletHit()
                }
            })
        }

        // TODO: this never seems to trigger
        // if (target === collisionUfoMesh.physicsImpostor) {
        // TODO: show explosion and destroy enemy ship
        //     console.log("collision with ufo", collisionUfoMesh)
        // }

        if (bullet.physicsImpostor) {
            bullet.physicsImpostor.dispose()
        }

        bullet.dispose()

        cannonImpact.setPosition(object.object.getAbsolutePosition())
        cannonImpact.play()
    }

    cannonFired.setPosition(airplane.getAbsolutePosition())
    cannonFired.play()
}
