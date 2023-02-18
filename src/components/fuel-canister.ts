import * as ECS from "../../libs/pixi-ecs"
import { Messages, Assets } from "../constants"
import { default as PIXI_SOUND } from 'pixi-sound'



type FuelCanisterProps = {
    x: number,
    y: number
}

const CANISTER_SIZE = 50

/**
 * Fuel canister component
 */
export default class FuelCanister extends ECS.Component<FuelCanisterProps> {
    canister: PIXI.Sprite

    onInit() {
        // Create fuel canister at given coordinates
        this.canister = new PIXI.Sprite(PIXI.Texture.from(Assets.FUEL))
        this.canister.width = CANISTER_SIZE
        this.canister.height = CANISTER_SIZE
        this.canister.position.x = this.props.x
        this.canister.position.y = this.props.y - CANISTER_SIZE * 1.5
        this.owner.addChild(this.canister)

        this.subscribe(Messages.CAR_MOVED) 
    }

    onMessage(msg: ECS.Message) {
        if ( msg.action == Messages.CAR_MOVED ) {
            const carBounds = msg.data.carBounds

            // Car reached fuel canister => increase car fuel tank       
            if ( carBounds.right >= this.canister.getBounds().left ) {
                this.sendMessage(Messages.REFUEL)
                
                const sound =  PIXI_SOUND.find(Assets.FUEL_SOUND)
                sound.volume = 0.3
                sound.play()

                this.owner.removeComponent(this)
            }
        }
    }

    onRemove() {
        this.canister.parent.removeChild(this.canister) // remove itself from parent
    }
}