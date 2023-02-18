import * as ECS from "../../libs/pixi-ecs"


/**
 * DYI Game screen
 * contains member container -> should contain all content of screen
 */
export default class ScreenComponent extends ECS.Component {
    protected container: ECS.Container

    constructor(name: string) {
        super()

       this.container = new ECS.Container(this.name)
    }

    onInit() {
        this.container = new ECS.Container(this.name)
    }

    onRemove() {
        this.owner.destroyChild(this.container)
        this.container = new ECS.Container(this.name)
    }

}