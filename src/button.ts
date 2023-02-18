import * as ECS from "../libs/pixi-ecs"
import { Assets, DEFAULT_BUTTON, FONT_STYLE } from "./constants"

/**
 * credit: https://github.com/ANVoevodin/pixijs_v5_flexible_buttons/blob/master/src/components/Button.js
 */



type ButtonProps = {
    width: number,
    height: number,

    fontSize: number,
    label: string,
    stroke: string,
    strokeThickness: number,
    tint: number,

    overTint: number,
    activeTint: number,

    overStroke: string,
    activeStroke: string,
    onTap: () => {}
}

/**
 * Button Component
 */
export default class Button extends ECS.Component {
    settings: ButtonProps
    isOver: Boolean
    isActive: Boolean
    label: ECS.Text
    button: ECS.NineSlicePlane

    constructor(options: any = DEFAULT_BUTTON) {
        super()

        this.settings = {
            ...DEFAULT_BUTTON,
            ...options
        }
    }

    onInit() {
        const 
            texture = PIXI.Texture.from("button"),
            unscaledSize = 15

        this.button = new ECS.NineSlicePlane("button", texture, unscaledSize, unscaledSize, unscaledSize, unscaledSize)
        this.owner.addChild(this.button)

        // The button's state.
        /** Whether the cursor is over the button */
        this.isOver = false
        /** Whether we pressed on the button but didn't released yet */
        this.isActive = false

        // Main text on the button
        this.label = new ECS.Text(this.settings.label)
        this.label.anchor.set(0.5)
        this.owner.addChild(this.label)

        // Update visual appearance
        this.updateGraphics()

        // We want the button to be able to interact with pointer events, so we set this.interactive true
        this.button.interactive = true
        // Show the "hand-cursor" when the cursor is over the button
        this.button.buttonMode = true

        /** Bind functions on this context as long as we will use them as event handlers */
        this.onTap = this.onTap.bind(this)
        this.onOver = this.onOver.bind(this)
        this.onOut = this.onOut.bind(this)
        this.onDown = this.onDown.bind(this)
        this.onUp = this.onUp.bind(this)


        this.button.on('pointertap', this.onTap) // The moment when we release (click/tap) the button
        this.button.on('pointerover', this.onOver) // The moment when we put the cursor over the button
        this.button.on('pointerout', this.onOut) // The moment when we put the cursor out of the button
        this.button.on('pointerdown', this.onDown) // The moment when we pressed on the button but didn't release yet
        this.button.on('pointerup', this.onUp) // The moment when we release the button
        this.button.on('pointerupoutside', this.onUp) // The moment when we release the button being outside of it (e.g. we press on the button, move the cursor out of it, and release)

    }

    onTap() {
        if (this.settings.onTap) this.settings.onTap()
    }

    onOver() {
        this.isOver = true
        this.updateGraphics()
    }

    onOut() {
        this.isOver = false
        this.updateGraphics()
    }

    onDown() {
        this.isActive = true
        this.updateGraphics()
    }

    onUp() {
        this.isActive = false
        this.updateGraphics()
    }

    updateGraphics() {
        let stroke = this.settings.stroke
        if (this.isActive === true) {
            this.button.tint = this.settings.activeTint
            stroke = this.settings.activeStroke
        } else if (this.isOver === true) {
            this.button.tint = this.settings.overTint
            stroke = this.settings.overStroke
        } else {
            this.button.tint = this.settings.tint
        }

        this.label.text = this.settings.label
        this.label.style = {
            ...FONT_STYLE,
            stroke: this.settings.stroke,
            fontSize: this.settings.fontSize + 'px',
        }

        this.onResize()
    }

    /** Changes sizes and positions each time when the button updates */
    onResize() {
        this.button.width = this.settings.width
        this.button.height = this.settings.height

        this.label.x = this.button.width * 0.5
        this.label.y = this.button.height * 0.5

        this.owner.pivot.set(this.button.width * 0.5, this.button.height * 0.5)
    }
}