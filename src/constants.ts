// Game properites
export const SCREEN_WIDTH: number = 800
export const SCREEN_HEIGHT: number = 600

// Car specific
export const CAR_ACCELERATION: number = 0.002
export const CAR_MAX_SPEED: number = 2
export const CAR_MAX_REVERSE_SPEED: number = CAR_MAX_SPEED / 2
export const MAX_FUEL: number = 100
export const FUEL_CONSUMPTION: number = 0.11
export const FUEL_CANISTER_VOLUME: number = MAX_FUEL / 2

// Assets
export enum Assets {
    PATH_TO_FOLDER = "assets/",
    BACKGROUND = "background", 
    CAR_WHEEL = "carWheel",
    CAR_CHASSIS = "carChassis",
    DRIVER = "driverHead",
    GRASS = "grass",
    GROUND = "ground",
    DIRT = "dirt",
    BUTTON = "button",
    FUEL = "fuel",
    FUEL_SOUND = "fuel_sound",
    GAME_LOOP_SOUND = "game_loop_sound",
    DRIVER_DIED = "driver_died"
}

// Messages
export enum Messages {
    CAR_MOVED = "DISTANCE_CHANGE",
    HEAD_MAY_SMASH = "HEAD_MAY_SMASH",
    RESTART_GAME = "RESTART_GAME",
    SCORE_NOTIFY = "SCORE_NOTIFY",
    FUEL_NOTIFY = "FUEL_NOTIFY",
    EXIT_GAME = "EXIT_GAME",
    START_GAME = "START_GAME",
    GAME_OVER = "GAME_OVER",
    SHOW_SCORE = "SHOW_SCORE",
    CLOSE_SCORE = "CLOSE_SCORE",
    REFUEL = "REFUEL",
    DRIVER_DIED = "DRIVER_DIED",
    EMPTY_FUEL_TANK = "EMPTY_FUEL_TANK"

}

// Terrain specific
export const MAP_UNIT: number = 50
export const MAP_BLOCK_SIZE: number = SCREEN_WIDTH * 2
export const MAP_SIZE: number = MAP_BLOCK_SIZE * 2.5
export const MAX_TERRAIN_HEIGHT: number = SCREEN_HEIGHT * 0.9

// Default font style
export const FONT_STYLE = new PIXI.TextStyle({
    fontFamily: "Courier New",
    stroke: '#336699',
    strokeThickness: 1,
    fontSize: "25px",
    fill: "#b60000",
})

// Default button style
export const DEFAULT_BUTTON = {
    width: 150,
    height: 50,

    fontSize: 25,
    label: 'Button',
    stroke: '#336699',
    tint: 0xFFFFFF,

    overTint: 0xDDDDDD,
    activeTint: 0xAAAAAA,

    overStroke: '#225588',
    activeStroke: '#114477',
    onTap: () => {console.log("button clicked")},
}

export const RESULTS_FILE_NAME = "./results.txt"