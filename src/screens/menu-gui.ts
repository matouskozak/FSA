import * as ECS from "../../libs/pixi-ecs"
import {SCREEN_WIDTH, SCREEN_HEIGHT, Assets, Messages, FONT_STYLE} from "../constants"
import Button from "../components/button"
import ScreenComponent from "./screen-component"


/**
 * Main Menu GUI screen
 */
export default class MenuGUI extends ScreenComponent {
    constructor() {
        super("menu_gui_screen")
    }

    onInit() {
        const scene = this.owner.scene

        this.owner.addChild(this.container)

        // Background
        new ECS.Builder(scene)
            //.localPos(0, 0)
            .asSprite(PIXI.Texture.from(Assets.BACKGROUND))
            .withParent(this.container)
            .withName("background_sprite")
            .build()

        // Title Text
        const titleText = new ECS.Builder(this.scene)
            .anchor(0.5)
            .asText("Full Spead Ahead")
            .localPos(this.scene.stage.pivot.x + SCREEN_WIDTH / 2, 50 )
            .withParent(this.container)
            .withName("title_text")
            .build() as ECS.Text
        titleText.style = {...FONT_STYLE, fontSize: 40}

        // Play Button
        new ECS.Builder(scene)
            .withComponent(new Button({
                label: "Play",
                onTap: () => {this.sendMessage(Messages.START_GAME)}
                }))
            .localPos(SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2 - SCREEN_HEIGHT / 8)
            .withParent(this.container)
            .withName("play_button")
            .build()

        // High Scores Button
        new ECS.Builder(scene)
            .withComponent(new Button({
                label: "High Scores",
                fontSize: 18,
                onTap: () => {this.sendMessage(Messages.SHOW_SCORE)}
                }))
            .localPos(SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2 + SCREEN_HEIGHT / 8)
            .withParent(this.container)
            .withName("score_button")
            .build()     

    }
}