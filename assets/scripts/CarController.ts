import { _decorator, Component, geometry, Node, RigidBody, Vec3, lerp, BoxCollider, PhysicsSystem, math } from 'cc';
import { LeverController } from './LeverController';
import { GameController } from './GameController';
const { ccclass, property } = _decorator;

@ccclass('CarController')
export class CarController extends Component {

    @property(Node) booster: Node = null
    @property(Node) wheels: Node[] = []
    @property(Node) lever: Node = null
    @property(Node) cameraArm: Node = null
    @property(LeverController) leverController: LeverController = null
    @property(GameController) game: GameController = null

    @property acceleration: number = 5
    @property rotation: number = 50
    @property rayDirection: Vec3 = new Vec3(0, -1, 0)
    @property maxDistance: number = 10
    @property smoothSpeed: number = 0.125

    private canMove: boolean = true
    private isFalling: boolean = false
    private isBroken: boolean = false
    private canCheckPhysics: boolean = false

    private leverValue: number = null
    private currentSpeed: number = 0
    private targetSpeed: number = 0
    private deceleration: number = 10
    private maxSpeed: number = 13

    protected start(): void {

        this.scheduleOnce(()=>{
            this.canCheckPhysics = true
        }, .1)
        
    }

    update(deltaTime: number) {

        this.leverValue = this.leverController.getLeverValue()

        this.addMovement(deltaTime)

        if (!this.isOnRoad()){
            if (this.canCheckPhysics) {
                this.startFalling()
            }
        }

        this.smoothCameraFollow()

    }

    addMovement(dt: number) {
        if (this.canMove) {

            if (this.isFalling) return

            this.targetSpeed = this.maxSpeed * this.leverValue;

            if (this.currentSpeed < this.targetSpeed) {
                this.currentSpeed += this.acceleration * dt
            } else {
                this.currentSpeed = lerp(this.currentSpeed, this.targetSpeed, this.deceleration * dt)
            }

            let pos = this.node.getPosition()
            this.node.setPosition(new Vec3(pos.x + this.currentSpeed * dt, pos.y, pos.z))

            let wheelRotation = this.currentSpeed * this.rotation * dt
            this.wheels.forEach((wheel)=>{
                let currentRotation = wheel.eulerAngles
                wheel.setRotationFromEuler(currentRotation.x, currentRotation.y, currentRotation.z - wheelRotation)
            })

            let currentBoosterRotation = this.booster.eulerAngles
            let newBoosterRotation = this.currentSpeed * this.rotation * dt
            this.booster.setRotationFromEuler(currentBoosterRotation.x + newBoosterRotation, currentBoosterRotation.y, currentBoosterRotation.z)

        }
    }

    private isOnRoad(): boolean {

        let direction = this.rayDirection
        let maxDistance = this.maxDistance

        let ray = new geometry.Ray()
        
        ray.d = direction
        this.node.getPosition(ray.o)
                
        if (PhysicsSystem.instance.raycast(ray, 0xffffff, maxDistance, true)) {
            return true
        } else {
            return false
        }
    
    }

    private startFalling(): void {
        if (this.isBroken) return

        this.isFalling = true
        this.isBroken = true
        
        let carRb = this.node.getComponent(RigidBody)
        let carCollider = this.node.getComponent(BoxCollider)

        let timeout: number = 0

        if (this.node.getWorldPosition().x >= 75) {
            carRb.isDynamic = true
            carRb.mass = 1000
            carRb.applyImpulse(new Vec3(800, -100, 0))
            timeout = 200
        }

        setTimeout(()=>{
            let carParts = this.node.children
            let partMass = carRb.mass / carParts.length
            carRb.destroy()
            carCollider.destroy()

            carParts.forEach((part) => {
                
                if (part.getComponent(RigidBody) == null) {
                    part.addComponent(RigidBody)
                }

                let pRb = part.getComponent(RigidBody)
                pRb.isDynamic = true
                pRb.mass = partMass
                
            })

            this.game.gameEnd()
            
        }, timeout)

    }

    private smoothCameraFollow(): void {
        if (this.cameraArm) {

            let targetPos = new Vec3();
            this.node.getWorldPosition(targetPos)

            let desiredPosition = new Vec3(
                targetPos.x,
                this.cameraArm.getPosition().y,
                targetPos.z
            );

            let currentPosition = this.cameraArm.getWorldPosition()

            let smoothPosition = new Vec3(
                math.lerp(currentPosition.x, desiredPosition.x, this.smoothSpeed),
                currentPosition.y,
                math.lerp(currentPosition.z, desiredPosition.z, this.smoothSpeed),
            )

            this.cameraArm.setWorldPosition(smoothPosition)

            let background = this.cameraArm.getChildByName('BackgroundPlane')
            let parallaxFactor = -.2

            let backgroundOffset = new Vec3(smoothPosition.x * parallaxFactor, background.getPosition().y, background.getPosition().z)

            background.setPosition(backgroundOffset)
        }
    }


}


