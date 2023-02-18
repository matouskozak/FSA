import * as ECS from "../libs/pixi-ecs"
import { Messages } from "./constants"
import Game from "./screens/game"
import GameGUI from "./screens/game-gui"
import Leaderboard from "./screens/leaderboard"
import MenuGUI from "./screens/menu-gui"

/**
 * Game Manager
 * managing game life cycle
 */
export default class GameManager extends ECS.Component {
    game: Game
    gameGUI: GameGUI
    menuGUI: MenuGUI
    leaderBoard: Leaderboard
    scene: ECS.Scene

    onInit() {
        this.scene = this.owner.scene
        

        this.game = new Game()
        this.gameGUI = new GameGUI()
        this.menuGUI = new MenuGUI()
        this.leaderBoard = new Leaderboard()

        this.subscribe(Messages.START_GAME)
        this.subscribe(Messages.EXIT_GAME)
        this.subscribe(Messages.RESTART_GAME)
        this.subscribe(Messages.SHOW_SCORE)
        this.subscribe(Messages.CLOSE_SCORE)

        this.showMenu()
    }
    
    onMessage(msg: ECS.Message) {
        if ( msg.action == Messages.START_GAME ) {
            this.closeMenu()
            this.startGame()
        }

        if ( msg.action == Messages.EXIT_GAME ) {
            const gameScore = this.game.getScore()            
            this.leaderBoard.addScore("John Doe", gameScore)

            this.exitGame()
            this.showMenu()
        }

        if ( msg.action == Messages.RESTART_GAME ) {
            const gameScore = this.game.getScore()            
            this.leaderBoard.addScore("John Doe", gameScore)

            this.exitGame()
            this.startGame()
        }


        if ( msg.action == Messages.SHOW_SCORE ) {
            this.closeMenu()
            this.showScore()
        }

        if ( msg.action == Messages.CLOSE_SCORE ) {
            this.closeScore()
            this.showMenu()
        }
    }

    private showMenu() {
        this.scene.stage.addComponent(this.menuGUI)
    }

    private closeMenu() {
        this.scene.stage.removeComponent(this.menuGUI)
    }

    private startGame() {
        this.scene.stage.addComponent(this.game)
        this.scene.stage.addComponent(this.gameGUI)
    }

    private exitGame() {        
        this.scene.stage.removeComponent(this.game)
        this.scene.stage.removeComponent(this.gameGUI)
    }

    private showScore() {
        this.scene.stage.addComponent(this.leaderBoard)
    }

    private closeScore() {
        this.scene.stage.removeComponent(this.leaderBoard)
    }
}