import { _decorator, Component, Node, EventTouch, Vec3, tween, Tween, math } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('LeverController')
export class LeverController extends Component {

    @property(Node) leverHandle: Node = null
    @property(Node) tutorial: Node = null
    private minY: number = -60
    private maxY: number = 60
    private minScale: number = .95
    private maxScale: number = 1.1
    private leverTween: Tween<Node> = null

    onLoad() {
        this.node.on(Node.EventType.TOUCH_START, this.onTouchStart, this)
        this.node.on(Node.EventType.TOUCH_MOVE, this.onTouchMove, this)
        this.node.on(Node.EventType.TOUCH_END, this.onTouchEnd, this)
        this.node.on(Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this)
    }

    protected update(dt: number): void {
        this.updateLeverScale(this.leverHandle.getPosition().y)
    }

    onTouchStart(event: EventTouch) {

        this.tutorial.active = false

        if (this.leverTween) {
            this.leverTween.stop()
            this.leverTween = null
        }
    }

    onTouchMove(event: EventTouch) {
        let delta = event.getDelta()
        let newY = this.leverHandle.getPosition().y + delta.y

        newY = Math.max(this.minY, Math.min(this.maxY, newY))

        this.leverHandle.setPosition(new Vec3(0, newY, 0))

    }

    onTouchEnd(event: EventTouch) {

        this.leverTween = tween(this.leverHandle)
            .to(0.75, { position: new Vec3(0, this.minY, 0) }, { easing: 'sineOut' })
            .start()

    }

    private updateLeverScale(leverY: number) {
        let scaleFactor = math.lerp(this.minScale, this.maxScale, 1 - Math.abs((leverY - this.minY) / ((this.maxY - this.minY) / 2) - 1))
        this.leverHandle.setScale(scaleFactor, scaleFactor, scaleFactor)
    }

    public getLeverValue(): number {
        return (this.leverHandle.getPosition().y - this.minY) / (this.maxY - this.minY)
    }
}


