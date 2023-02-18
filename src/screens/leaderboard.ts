import * as ECS from "../../libs/pixi-ecs"
import { Assets, FONT_STYLE, Messages, RESULTS_FILE_NAME, SCREEN_HEIGHT, SCREEN_WIDTH } from "../constants"
import ScreenComponent from "./screen-component"
import Button from "../components/button"

const MARGIN = 50

// TODO input name https://www.npmjs.com/package/pixi-text-input
// TODO saving to file

/**
 * Leaderboard screen 
 */
export default class Leaderboard extends ScreenComponent {
    private table: {key: string, value: number}[] = []
    private DISPLAY_MAX: number = 10

    constructor() {
        super("leaderboard_screen")
    }


    onInit() {
        this.owner.addChild(this.container)

        this.loadTable(RESULTS_FILE_NAME)

        // Background
        new ECS.Builder(this.scene)
            //.localPos(0, 0)
            .asSprite(PIXI.Texture.from(Assets.BACKGROUND))
            .withParent(this.container)
            .withName("background_sprite")
            .build()

        // Title Text
        new ECS.Builder(this.scene)
            .anchor(0.5)
            .asText("High Scores", FONT_STYLE)
            .localPos(this.scene.stage.pivot.x + SCREEN_WIDTH / 2, MARGIN )
            .withParent(this.container)
            .withName("high_scores_text")
            .build()

        // Exit Button
        new ECS.Builder(this.scene)
            .withComponent(new Button({
                label: "Exit",
                onTap: () => {this.sendMessage(Messages.CLOSE_SCORE)}
                }))
            .localPos(this.scene.stage.pivot.x + SCREEN_WIDTH / 2, SCREEN_HEIGHT - MARGIN )
            .withParent(this.container)
            .withName("exit_button")
            .build()



        this.displayTable(this.DISPLAY_MAX)
    }

    onRemove() {
        super.onRemove()

        this.saveTable(RESULTS_FILE_NAME)
    }


    /**
     * Add score to leaderboard and sort it
     * @param playerName 
     * @param result 
     */
    addScore(playerName: string, result: number) {
        this.table.push({key: playerName, value: result})
        this.table.sort((a, b) => b.value - a.value)
    }


    /**
     * Create leaderboard table
     * @param numItems number of scores to display
     */
    private displayTable(numItems: number) {
        const spacing = SCREEN_WIDTH / (numItems * 2)

        for ( let i = 0; i < Math.min(this.table.length, numItems); ++i ) {
            const text = new ECS.Builder(this.scene)
                .anchor(0.5)
                .localPos(this.scene.stage.pivot.x + SCREEN_WIDTH / 2, MARGIN + spacing * (i + 1))
                .asText(i + 1 + ".\t\t" + this.table[i].key + "\t\t" + this.table[i].value)
                .withParent(this.container)
                .withName("score_" + i)
                .build() as ECS.Text

            text.style = {...FONT_STYLE,
                            fontSize: 15}
        }
    }

    // TODO
    private loadTable(inName: string) {

    }

    // TODO
    private saveTable(outName: string) {
        
    }
} 