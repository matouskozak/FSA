import * as PixiMatter from "../../libs/pixi-matter"
import * as ECS from "../../libs/pixi-ecs"
import * as Matter from "matter-js"
import { SCREEN_HEIGHT, Messages, MAP_BLOCK_SIZE, MAP_SIZE, MAX_TERRAIN_HEIGHT, MAP_UNIT, Assets, SCREEN_WIDTH } from "../constants"
import FuelCanister from "./fuel-canister"

//import { noise } from "@chriscourses/perlin-noise"

// TODO maybe TerrainGenerator class

type TerrainProps = {
    binder: PixiMatter.MatterBind
  }

/**
 * Terrain Component
 */
export default class Terrain extends ECS.Component<TerrainProps> {
    binder: PixiMatter.MatterBind
    leftEdge: number
    rightEdge: number
    leftWall: ECS.Container
    rightWall: ECS.Container
    points: {x: number, y: number}[] = []
    terrainMatter: ECS.Container
    terrainGraphics: ECS.Container


    onInit() {
        this.binder = this.props.binder
        this.leftEdge = 0
        this.rightEdge = MAP_SIZE
        this.terrainMatter = new ECS.Container("terrain_matter_container")
        this.terrainGraphics = new ECS.Container("terrain_graphics_container")
        this.owner.addChild(this.terrainMatter)
        this.owner.addChild(this.terrainGraphics)

        // Borders
        this.leftWall = this.binder.addBody(Matter.Bodies.rectangle(this.leftEdge, SCREEN_HEIGHT / 2, 10, SCREEN_HEIGHT, {
            label: "left_wall",
            isStatic: true}))
        this.owner.addChild(this.leftWall)

        this.rightWall = this.binder.addBody(Matter.Bodies.rectangle(this.rightEdge - MAP_BLOCK_SIZE, SCREEN_HEIGHT / 2, 10, SCREEN_HEIGHT, {
            label: "right_wall",
            isStatic: true,
            isSensor: true}))
        this.owner.addChild(this.rightWall)


        // Generate first terrain
        this.points = this.generatePoints(this.leftEdge, this.rightEdge, MAX_TERRAIN_HEIGHT)
        this.createTerrain(this.points)

        this.subscribe(Messages.HEAD_MAY_SMASH)
        this.subscribe(Messages.CAR_MOVED)
    }

    onMessage(msg: ECS.Message) {
        // Car Moved
        if ( msg.action == Messages.CAR_MOVED ) { 
            const carBounds = msg.data.carBounds

            // Car reached right borded => generate more terrain         
            if ( carBounds.right >= this.rightWall.getBounds().left ) { 
                this.increaseTerrain()
            }
        }
        
        // Head in ackward possition
        if ( msg.action == Messages.HEAD_MAY_SMASH ) {
            const 
                headBody = msg.data.headBody,
                headBounds = headBody.bounds,
                headPos = headBody.position

            this.terrainMatter.children.forEach(child => {
                const 
                    childMatter = child as PixiMatter.MatterBody,
                    childBounds = childMatter.body.bounds

                if ( headPos.x >= childBounds.min.x && headPos.x <= childBounds.max.x ) { // Filter relevant terrain bodies
                    if ( headBounds.max.y >= childBounds.min.y || headBounds.max.y >= childBounds.max.y ) { // Check if head is touching
                        console.log("Head smash")
                        this.sendMessage(Messages.DRIVER_DIED)
                    }
                }
            })
        }
    }

            

    getLeftEdge() {
        return this.leftEdge
    }

    /**
     * Generate more terrain to the right
     * by MAP_BLOCK_SIZE distance
     */
    private increaseTerrain() {
        // Remove far away points      
        this.leftEdge += MAP_BLOCK_SIZE
        const  newLeftBorder = this.leftEdge
        let newPoints = this.points.filter(function (vertex) { 
            return (vertex.x >= newLeftBorder);
        })

        // Remove old matter parts
        this.terrainMatter.children.forEach(child => {
            const childMatter = child as PixiMatter.MatterBody
            if ( childMatter.body.bounds.min.x <= newLeftBorder ) {
                Matter.World.remove(this.binder.mWorld, childMatter.body)
                child.destroy()
            }
        });

        // Remove old graphics 
        this.terrainGraphics.children.forEach(child => {
            if ( child.getBounds().right <= this.leftWall.getBounds().left + MAP_BLOCK_SIZE ) {
                child.parent.removeChild(child)
            }
        });

        // Generate new points
        const lastPoint = newPoints[newPoints.length - 1]
        let generatedPoints = this.generatePoints(this.rightEdge, this.rightEdge + MAP_BLOCK_SIZE, MAX_TERRAIN_HEIGHT)
        newPoints.push(...generatedPoints)
        this.points = newPoints
        this.rightEdge += MAP_BLOCK_SIZE
        generatedPoints.unshift(lastPoint)

        // Create terrain from new points
        this.createTerrain(generatedPoints)

        // Move borders
        Matter.Body.translate((this.rightWall as PixiMatter.MatterBody).body, {x: MAP_BLOCK_SIZE, y: 0})
        Matter.Body.translate((this.leftWall as PixiMatter.MatterBody).body, {x: MAP_BLOCK_SIZE, y: 0})
    }

    /**
     * Generate random points between startX and endX
     * and smooth them
     * @param startX start x coordinate
     * @param endX end x coordinate
     * @param maxY max y value
    */
    private generatePoints(startX: number, endX: number, maxY: number) {
        let generatedPoints = []

        // Generate points
        for (let x = startX; x < endX; x += MAP_UNIT) {
            let rawNoise = Math.random()
            let y = Math.floor(rawNoise * maxY)

            generatedPoints.push({x: x, y: SCREEN_HEIGHT - y})
        }

        // Run smoothing
        for ( let i = 0; i < 3; ++i ) {
            this.smooth(generatedPoints)
        }

        return generatedPoints
    }

    /**
     * Smooth new points with relation to current points (this.points)
     * @param points new points to smooth
     */
    private smooth(points: Matter.Vector[]) {
        const numNewPoints = points.length
        const numOldPoints = this.points.length


        const WINDOW_SIZE = 2
        /* TODO sliding window
        let leftSum = 0
        let rightSum = points.slice(0, WINDOW_SIZE + 1).reduce(function(sum, b){
            return sum + b.y;
        }, 0); */

        // Replace height of each point with average height of neighbours
        for ( let i = numOldPoints; i < numOldPoints + numNewPoints; ++i ) {
            const currentHeight = points[i - numOldPoints].y
            
            let neighboursSum = 0;
            let numNeighbours = 0;
            
            for ( let j = i - WINDOW_SIZE; j < i + WINDOW_SIZE; ++j ) {
                if ( j < 0 || j >= numOldPoints + numNewPoints )
                    continue

                if ( j >= numOldPoints )
                    neighboursSum += points[j - numOldPoints].y
                else
                    neighboursSum += this.points[j].y

                ++numNeighbours
            }
            
            points[i - numOldPoints].y = neighboursSum / numNeighbours
        }

        return points
    }

    /**
     * Create terrain from given points
     * @param points 
     */
    private createTerrain(points: Matter.Vector[]) {
        this.createTerrainBodyNew(points)
        this.drawTerrain(points)
        this.addFuelCanister(points)
    }


    /**
     * Create terrain matter body from given points
     * @param points 
     */
    private createTerrainBodyNew(points: Matter.Vector[]) {
        let pointPrev = points[0]
        for ( let i = 0; i < points.length; ++i ) {
            const currentPoint = points[i]
            const a = pointPrev.x - currentPoint.x
            const b = pointPrev.y - currentPoint.y
            const lineRect = Matter.Bodies.rectangle((pointPrev.x + currentPoint.x) / 2, (pointPrev.y + currentPoint.y) / 2, 
                                                    Math.sqrt(Math.pow(a, 2) + Math.pow(b, 2)), 10, {isStatic: true})

            Matter.Body.rotate(lineRect, Math.atan2(b, a))

            const lineBind = this.binder.addBody(lineRect)
            this.terrainMatter.addChild(lineBind)


            pointPrev = currentPoint
        }
    }

    /**
     * Draw terrain sprite around given points
     * @param points 
     */
    private drawTerrain(points: Matter.Vector[]) {
        // Create terrain mask
        let graphics = new PIXI.Graphics()
        const pivotOffset = 0
        graphics.beginFill()

        const startPoint = points[0]
        graphics.moveTo(startPoint.x + pivotOffset, SCREEN_HEIGHT)
        for ( let i = 0; i < points.length; ++i ) {
            graphics.lineTo(points[i].x + pivotOffset, points[i].y)
        }
        const lastPoint = points[points.length - 1]

        graphics.lineTo(lastPoint.x + pivotOffset, SCREEN_HEIGHT)
        graphics.lineTo(startPoint.x + pivotOffset, SCREEN_HEIGHT)
        graphics.tint = 0xFF00FF
        graphics.position.y -= 6

        graphics.endFill()

        // Current terrain graphics container
        const graphicsContainer = new ECS.Container("graphics_start_" + startPoint.x)
        graphicsContainer.addChild(graphics)

        // Grass
        let grassRope = new PIXI.SimpleRope(PIXI.Texture.from(Assets.GRASS), points as PIXI.Point[], 0.5)
        grassRope.position.y -= 10
        graphicsContainer.addChild(grassRope)

        // Dirt
        let dirtSprite = new PIXI.TilingSprite(PIXI.Texture.from(Assets.DIRT), MAP_SIZE, SCREEN_HEIGHT)
        dirtSprite.texture.baseTexture.wrapMode = PIXI.WRAP_MODES.REPEAT
        dirtSprite.position.x = startPoint.x
        dirtSprite.mask = graphics
        graphicsContainer.addChild(dirtSprite)



        this.terrainGraphics.addChild(graphicsContainer)
    }

    /**
     * Add zero/one fuel canisters to given points
     * based on randomness
     * @param points 
     */
    private addFuelCanister(points: Matter.Vector[]) {
        const numPoints = points.length
        const idx = Math.floor(Math.random() * numPoints)

        if ( Math.random() > 0.5 )
            this.owner.addComponent(new FuelCanister({x: points[idx].x, y: points[idx].y}))

    }
}