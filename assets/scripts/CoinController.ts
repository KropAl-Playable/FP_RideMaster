import { _decorator, Component, ITriggerEvent, Node, SphereCollider } from 'cc';
import { GameController } from './GameController';
const { ccclass, property } = _decorator;

@ccclass('CoinController')
export class CoinController extends Component {

    private collider: SphereCollider = null
    public game: GameController = null
    public carReference: Node = null

    start() {
        this.collider = this.node.getComponent(SphereCollider)
        this.collider.on('onTriggerEnter', this.onTriggerEnter, this)
    }

    onTriggerEnter(event: ITriggerEvent) {
        if (event.otherCollider.node == this.carReference) {
            this.game.addCoin()
            this.node.destroy()
        }
    }

}


