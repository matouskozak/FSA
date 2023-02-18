import * as ECS from "../libs/pixi-ecs"

import {SCREEN_WIDTH, SCREEN_HEIGHT, Assets} from "./constants"
import GameManager from "./game-manager"

class Index {
    engine: ECS.Engine
    constructor(canvas: HTMLCanvasElement) {
        this.engine = new ECS.Engine()

        this.engine.init(canvas, {
            resizeToScreen: true,
			width: SCREEN_WIDTH,
			height: SCREEN_HEIGHT,
            resolution: 1,
            transparent: false,
            antialias: true
        })
        
        this.engine.app.loader
            .reset()
            // Images
            .add(Assets.BACKGROUND, Assets.PATH_TO_FOLDER + "sky.png")
            .add(Assets.CAR_CHASSIS, Assets.PATH_TO_FOLDER + "car.png")
            .add(Assets.CAR_WHEEL, Assets.PATH_TO_FOLDER + "wheel.png")
            .add(Assets.DRIVER, Assets.PATH_TO_FOLDER + "head.png")
            .add(Assets.GROUND, Assets.PATH_TO_FOLDER + "ground.png")
            .add(Assets.GRASS, Assets.PATH_TO_FOLDER + "grass.png")
            .add(Assets.DIRT, Assets.PATH_TO_FOLDER + "dirt.png")
            .add(Assets.BUTTON, Assets.PATH_TO_FOLDER + "button.png")
            .add(Assets.FUEL, Assets.PATH_TO_FOLDER + "fuel.png")
            // Sounds
            .add(Assets.FUEL_SOUND, Assets.PATH_TO_FOLDER + "fuel_increase.wav")
            .add(Assets.GAME_LOOP_SOUND, Assets.PATH_TO_FOLDER + "game_loop_dodo.wav")
            .add(Assets.DRIVER_DIED, Assets.PATH_TO_FOLDER + "death.wav")
            .load(() => this.onAssetsLoaded())
    }


    onAssetsLoaded() {
        let scene = this.engine.scene

        const screenWidth = scene.app.screen.width
        const screenHeight = scene.app.screen.height

        scene.stage.addComponent(new ECS.KeyInputComponent())
        scene.stage.addComponent(new GameManager()) // Launch game
    }


}

// Create new instance as soon as the file is loaded
export default new Index(document.getElementById("gameCanvas") as HTMLCanvasElement)