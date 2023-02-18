import * as ECS from "../../libs/pixi-ecs"
import * as PixiMatter from "../../libs/pixi-matter"
import { default as PIXI_SOUND } from 'pixi-sound'
import Terrain from "../components/terrain"
import Car from "../components/car"
import ScreenComponent from "./screen-component"
import {SCREEN_WIDTH, Assets, Messages, MAX_TERRAIN_HEIGHT, SCREEN_HEIGHT} from "../constants"


/**
 * Game screen
 * Containing key components: car, terrain
 */
export default class Game extends ScreenComponent {
    private binder: PixiMatter.MatterBind
    private carContainer: ECS.Container
    private terrainContainer: ECS.Container
    private car: Car
    private terrain: Terrain
    private score: number
    private gameLoopSound: PIXI_SOUND.IMediaInstance

    constructor() {
        super("game_screen")
    }

    onInit() {
        const 
            binder = new PixiMatter.MatterBind(),
            scene = this.owner.scene
            
        binder.init(scene, {
            mouseControl: false,
            renderConstraints: false,
            renderAngles: false
        })

        this.owner.addChild(this.container)

        // Terrain
        this.terrain = new Terrain({
            binder: binder
        })

        this.terrainContainer = new ECS.Builder(scene)
            .asContainer()
            .withParent(this.container)
            .withName("terrain_container")
            .withComponent(this.terrain)
            .build();

        // Car
        this.car = new Car({
            binder: binder,
            x: SCREEN_WIDTH / 4,
            y: SCREEN_HEIGHT - MAX_TERRAIN_HEIGHT,
            width: 160,
            height: 80,
            wheelSize: 50,
            wheelbase: 70,
            wheelOffset: 55})

        this.carContainer = new ECS.Builder(scene)
            //.anchor(0.5)
            .asContainer()
            .withParent(this.container)
            .withName("car_container")
            .withComponent(this.car)
            .build()
            
        // Background
        new ECS.Builder(scene)
            .localPos(0, 0)
            .asSprite(PIXI.Texture.from(Assets.BACKGROUND))
            .withParent(this.container)
            .withName("background_sprite")
            .withComponent(new BackgroundController())
            .build()

        this.gameLoopSound = this.startMusic()

        this.subscribe(Messages.CAR_MOVED)
        this.subscribe(Messages.DRIVER_DIED)
        this.subscribe(Messages.EMPTY_FUEL_TANK)
    }

    /**
     * Return current game score
     */
    getScore() {
        return this.score
    }

    onMessage(msg: ECS.Message) {
        if ( msg.action == Messages.CAR_MOVED ) {
            const carPosX = msg.data.carPosition.x

            // Score update
            this.score = Math.floor(carPosX / 100)
            this.sendMessage(Messages.SCORE_NOTIFY, {"score": this.getScore()})


            // Check car fuel tank
            const fuelTank = this.car.getFuelTank()
            this.sendMessage(Messages.FUEL_NOTIFY, {"fuelTank": fuelTank})
            

            // Camera fixed to car
            if ( carPosX > this.terrain.getLeftEdge() + SCREEN_WIDTH / 2 ) {
                this.container.pivot.x = carPosX - SCREEN_WIDTH / 2
            }
        }

        // Game over
        if ( msg.action == Messages.DRIVER_DIED || msg.action == Messages.EMPTY_FUEL_TANK ) {
            this.gameLoopSound.stop()
            this.sendMessage(Messages.GAME_OVER)
        }
    }

    onRemove() {
        this.stopMusic(this.gameLoopSound)

        super.onRemove()
    }

    /**
     * Starts game loop music
     * Annoying
     */
    private startMusic() {
        const sound = PIXI_SOUND.find(Assets.GAME_LOOP_SOUND)
        sound.loop = true
        sound.volume = 0.5
        return sound.play() as PIXI_SOUND.IMediaInstance
    }

    /**
     * Stops given music
     * @param music 
     */
    private stopMusic(music: PIXI_SOUND.IMediaInstance) {
        music.stop()
    }


}


class BackgroundController extends ECS.Component {
    onInit() {
        this.owner.parent.setChildIndex(this.owner, 0)
    }
    onResize(width: number, height: number) {
        this.owner.width = width
    }

    onUpdate(delta: number, absolute: number) {
        this.owner.position.x = this.owner.parent.pivot.x - SCREEN_WIDTH / 2
    }
}



