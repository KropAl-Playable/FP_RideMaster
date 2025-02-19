import { _decorator, Animation, BoxCollider, color, Component, ICollisionEvent, instantiate, Node, Prefab, RigidBody, Sprite, Vec3, tween, math } from 'cc';
import { CoinController } from './CoinController';
import { LeverController } from './LeverController';
const { ccclass, property } = _decorator;

@ccclass('GameController')
export class GameController extends Component {

    @property(Prefab) woodBlock: Prefab = null
    @property(Prefab) coinPrefab: Prefab = null
    @property(Node) carNode: Node = null
    @property(Node) numbers: Node = null
    @property(Node) overlay: Node = null
    @property(Node) dwnBtn: Node = null

    @property blocksCount: number = 80
    @property xOffset: number = 1.25
    @property fallDelay: number = 270 
    @property numbersOffset: number = 40

    private blockArray: Node[] = []
    private fallenBlocks: number = 0
    private coinCount: number = 0

    onLoad() {

        this.spawnWoodBlocks()

        this.spawnCoins()

    }

    spawnWoodBlocks() {
        for (let i = 0; i < this.blocksCount; i++) {
            let newBlock = instantiate(this.woodBlock)
            newBlock.setPosition(new Vec3(this.xOffset * i, 0, 0))
            this.node.addChild(newBlock)

            this.blockArray.push(newBlock)

            const blockCollider = newBlock.getComponent(BoxCollider)
            blockCollider.on('onCollisionEnter', this.blockOnCollision, this)
        }
    }

    blockOnCollision(event: ICollisionEvent) {

        let currentBlock = event.selfCollider.node
        let blockRb = currentBlock.getComponent(RigidBody)

        setTimeout(()=>{
            this.enableBlockPhysics(blockRb)
        }, this.fallDelay)
        
    }

    enableBlockPhysics(rb: RigidBody) {
        this.fallenBlocks++
        rb.isDynamic = true
        rb.mass = 200
        rb.useGravity = true
        rb.angularFactor = new Vec3 (0, 0, 1)
        let randomTorqueZ = Math.random() * 5 + 2
        rb.applyTorque(new Vec3(0, 0, randomTorqueZ))
    }

    update(deltaTime: number) {
        if (this.carNode.position.x > 75) {
            this.fallDelay = 50
        }
    }

    spawnCoins() {

        for (let i = 0; i < 10; i++) {

            let newCoin = instantiate(this.coinPrefab)
            let coinPos = new Vec3()
            newCoin.getPosition(coinPos)

            const controller = newCoin.getComponent(CoinController)
            controller.game = this
            controller.carReference = this.carNode

            newCoin.setPosition(new Vec3(coinPos.x + 24*i, coinPos.y, 0))
            this.node.addChild(newCoin)

        }
    }

    addCoin() {
        this.coinCount++
        let newPos = new Vec3()
        this.numbers.getPosition(newPos)
        this.numbers.setPosition(new Vec3(newPos.x, newPos.y + this.numbersOffset, newPos.z))
    }

    gameEnd() {

        if (this.overlay) {
            this.overlay.active = true
            const anim = this.overlay.getComponent(Animation)
            anim.play(anim.defaultClip.name)

            anim.once(Animation.EventType.FINISHED, ()=>{
                anim.play("button_pulse")
            })
        }

        const btnAnim = this.dwnBtn.getComponent(Animation)
        btnAnim.play("btn_dissappear")

    }

    redirectClick(): void {
        console.log('cta clicked')
        CTA.onClick()
    }
}


