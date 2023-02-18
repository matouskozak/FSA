import * as PixiMatter from "../../libs/pixi-matter"
import * as ECS from "../../libs/pixi-ecs"
import * as Matter from "matter-js"
import { Assets, Messages } from "../constants"
import { default as PIXI_SOUND } from 'pixi-sound'

type DriverProps = {
    binder: PixiMatter.MatterBind,
    car: Matter.Body,
    headSize: number,
    torsoWidth: number, 
    torsoHeight: number
}

// TODO fix head spinning

/**
 * Driver component
 */
export default class Driver extends ECS.Component<DriverProps>{
    private head: PixiMatter.MatterBody
    private torso: PixiMatter.MatterBody
    private isDead: Boolean

    onInit() {
        const
            binder = this.props.binder,
            car = this.props.car,
            headSize = this.props.headSize,
            torsoWidth = this.props.torsoWidth,
            torsoHeight = this.props.torsoHeight

        // Driver torso
        const torsoBody = Matter.Bodies.rectangle(car.position.x, car.position.y - torsoHeight, torsoWidth, torsoHeight, {
            label: "driver_torso",
            collisionFilter: {
                group: car.collisionFilter.group
            },
            density: 0.0001
        })
        const torso = binder.addBody(torsoBody)  
        this.owner.addChild(torso)   
        this.torso = torso as PixiMatter.MatterBody

        // Attach torso to car
        const torsoJoint = binder.addConstraint(Matter.Constraint.create({
            bodyA: torsoBody,
            pointA: {x: 0, y: torsoHeight / 2},
            bodyB: car,
            length: 0,
            stiffness: 1
            
        }))

        const { min, max } = car.bounds
        const carWidth = max.x - min.x,
                carHeight = max.y - min.y
        binder.addConstraint(Matter.Constraint.create({
            bodyA: torsoBody,
            pointA: {x: 0, y: -torsoHeight / 2},
            bodyB: car,
            pointB: {x: -(carWidth / 2), y: 0},
            stiffness: 0.5
            
        }))
        binder.addConstraint(Matter.Constraint.create({
            bodyA: torsoBody,
            pointA: {x: 0, y: -torsoHeight / 2},
            bodyB: car,
            pointB: {x: +(carWidth / 2), y: 0},
            stiffness: 0.5
            
        }))


        // Driver Head
        const headBody = Matter.Bodies.circle(car.position.x, car.position.y - headSize * 2, headSize / 2, {
            label: "driver_head",
            collisionFilter: {
                group: car.collisionFilter.group
            },
            density: 0.0001
        })
        const head = binder.addBody(headBody)
        this.owner.addChild(head)
        this.head = head as PixiMatter.MatterBody

        // Head Texture
        const headTexture = PIXI.Texture.from(Assets.DRIVER)
        const headSprite = new PIXI.Sprite(headTexture)
        headSprite.anchor.set(0.5, 0.5);
        headSprite.x = head.position.x 
        headSprite.y = head.position.y
        headSprite.scale.x = headSize / headTexture.width
        headSprite.scale.y = headSize / headTexture.height
        head.addChild(headSprite);


        // Neck joint
        let headJoint = binder.addConstraint(Matter.Constraint.create({
            bodyA: torsoBody,
            pointA: {x: 0, y: -torsoHeight / 2},
            bodyB: headBody, 
            pointB: {x: 0, y: 0},
            stiffness: 1,
            length: 0
        }))

        /*
        binder.addConstraint(Matter.Constraint.create({
            bodyA: headBody,
            bodyB: car,
            pointB: {x: -(carWidth / 2), y: 0},
            stiffness: 0.1,
        }))
        binder.addConstraint(Matter.Constraint.create({
            bodyA: headBody,
            bodyB: car,
            pointB: {x: +(carWidth / 2), y: 0},
            stiffness: 0.1,            
        }))*/

        
        this.isDead = false
        this.subscribe(Messages.CAR_MOVED)
        this.subscribe(Messages.DRIVER_DIED)
    }

    onMessage(msg: ECS.Message) {
        if ( msg.action == Messages.CAR_MOVED ) {
            const carPosition = msg.data.carPosition

            if ( this.head.body.position.y > carPosition.y ) {
                this.sendMessage(Messages.HEAD_MAY_SMASH,
                    {headBody: this.head.body})   
                }
        }

        if ( msg.action == Messages.DRIVER_DIED && !this.isDead ) {
            this.isDead = true

            const sound =  PIXI_SOUND.find(Assets.DRIVER_DIED)
            sound.volume = 0.1
            sound.play()
        }
    }
        
}