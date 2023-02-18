import * as ECS from "../../libs/pixi-ecs"
import {SCREEN_WIDTH, SCREEN_HEIGHT, Messages, Assets, FONT_STYLE, MAX_FUEL} from "../constants"
import Button from "../components/button"
import ScreenComponent from "./screen-component"

const TOP_MARGIN = 50
const SIDE_MARGIN = 100

/**
 * In game GUI screen
 */
export default class GameGUI extends ScreenComponent {
    private restartButton: ECS.Container
    private exitButton: ECS.Container
    private currentDistanceText: ECS.Text
    private gameOverText: ECS.Text
    private fuelStatusContainer: ECS.Container
    private gameIsRunning: Boolean
    private score: number

    constructor() {
        super("game_gui_container")
    }

    onInit() {
        this.buildMenu()

        this.gameIsRunning = true

        // Prepare gameover text
        this.gameOverText = new ECS.Builder(this.scene)
            .anchor(0.5)
            .localPos(SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2)
            .asText("GAME OVER", FONT_STYLE)
            .withName("game_over_text")
            .build() 

        this.subscribe(Messages.GAME_OVER)
        this.subscribe(Messages.SCORE_NOTIFY)
    }

    onMessage(msg: ECS.Message) {
        if ( msg.action == Messages.SCORE_NOTIFY ) {
            this.score = msg.data.score
            this.currentDistanceText.text = msg.data.score
        }

        // First game over message
        if ( msg.action == Messages.GAME_OVER && this.gameIsRunning ) {
            console.log("Game over animation begins")
            
            this.container.addChild(this.gameOverText)

            // Achieved score
            new ECS.Builder(this.scene)
                .anchor(0.5)
                .localPos(SCREEN_WIDTH / 2, SCREEN_HEIGHT / 4)
                .asText("Your score: " + this.score, FONT_STYLE)
                .withParent(this.container)
                .build() 

            this.gameIsRunning = false
            this.disableMenu()

            setTimeout(() => {this.sendMessage(Messages.EXIT_GAME)}, 2200) // End game in 2.2s    
        }
    }

    onUpdate(delta: number) {
        this.container.position.x = this.owner.scene.stage.pivot.x

        if ( !this.gameIsRunning ) {
            // Increate fontSize
            this.gameOverText.style = {
                ...FONT_STYLE, 
                fontSize: parseInt(this.gameOverText.style.fontSize) + delta * 0.1
            }
        }
    }

    /**
     * Disables menu buttons
     */
    private disableMenu() {
        this.restartButton.renderable = false
        this.exitButton.renderable = false
    }

    /**
     * Builds menu elements
     */
    private buildMenu() {
        const scene = this.owner.scene
        this.owner.addChild(this.container)

        // Restart Button
        this.restartButton = new ECS.Builder(scene)
            .withComponent(new Button({
                label: "Restart",
                onTap: () => {this.sendMessage(Messages.RESTART_GAME)}
                }))
            .localPos(SCREEN_WIDTH / 2, TOP_MARGIN)
            .withParent(this.container)
            .withName("restart_button")
            .build()

        // Exit Button
        this.exitButton = new ECS.Builder(scene)
            .withComponent(new Button({
                label: "Exit",
                onTap: () => {this.sendMessage(Messages.EXIT_GAME)}
                }))
            .localPos(SIDE_MARGIN, TOP_MARGIN)
            .withParent(this.container)
            .withName("exit_button")
            .build()
            
        // Current Distance Text
        this.currentDistanceText = new ECS.Builder(scene)
            .anchor(0.5)
            .localPos(SCREEN_WIDTH - SIDE_MARGIN, TOP_MARGIN)
            .asText("DISTANCE", FONT_STYLE) 
            .withParent(this.container)
            .withName("current_distance_text")
            .build()            
        
        // Fuel Container
        this.fuelStatusContainer = new ECS.Builder(this.scene)
            .anchor(0.5)
            .localPos(SCREEN_WIDTH - 1.5 * SIDE_MARGIN, TOP_MARGIN + 30)
            .asContainer()
            .withName("fuel_status_container")
            .withParent(this.container)
            .withComponent(new FuelStatusController())
            .build()
    }
}

class FuelStatusController extends ECS.Component {
    height: number = 10
    width: number = MAX_FUEL
    statusBar: PIXI.Graphics

    onInit() {
        this.statusBar = new PIXI.Graphics()
        this.statusBar.beginFill(0x3c913f)
        this.statusBar.lineStyle(2, 0x000000)
        this.statusBar.drawRect(0, 0, this.width, this.height)
        this.statusBar.endFill()

        this.owner.addChild(this.statusBar)

        const canister = new PIXI.Sprite(PIXI.Texture.from(Assets.FUEL))
        canister.width = this.height * 2
        canister.height = this.height * 2
        canister.anchor.y = 0.5
        canister.position.x = this.statusBar.x - canister.width - 10
        canister.position.y = this.statusBar.y + this.height / 2

        this.owner.addChild(canister)

        this.subscribe(Messages.FUEL_NOTIFY)
    }

    onMessage(msg: ECS.Message) {
        if ( msg.action == Messages.FUEL_NOTIFY ) {
            this.statusBar.scale.x = msg.data.fuelTank / this.width
        }
    }
}
