
import * as PixiMatter from "../../libs/pixi-matter"
import * as ECS from "../../libs/pixi-ecs"
import * as Matter from "matter-js"
import { Assets, Messages, CAR_ACCELERATION, CAR_MAX_SPEED, FUEL_CONSUMPTION, MAX_FUEL, FUEL_CANISTER_VOLUME, CAR_MAX_REVERSE_SPEED } from "../constants"
import Driver from "./driver"

type CarProps = {
    binder: PixiMatter.MatterBind,
    x: number,
    y: number,
    width: number,
    height: number,
    wheelSize: number,
    wheelbase: number,
    wheelOffset: number
  }

// TODO Better matter body around car chassis

/**
 * Car component
 */
export default class Car extends ECS.Component<CarProps> {
    private frontWheel: PixiMatter.MatterBody
    private rearWheel: PixiMatter.MatterBody
    private chassis: PixiMatter.MatterBody
    private fuelTank: number

    onInit() {
        this.buildCar()

        // Create driver
        new ECS.Builder(this.props.binder.scene)
            //.anchor(0.5)
            .asContainer()
            .withParent(this.owner)
            .withName("driver_container")
            .withComponent(new Driver({
                binder: this.props.binder,
                car: this.chassis.body,
                headSize: 50,
                torsoWidth: 15, 
                torsoHeight: 35}))
            .build()

        this.fuelTank = MAX_FUEL

        this.subscribe(Messages.REFUEL)
    }

    onUpdate(delta: number) {
        const currentPos = this.chassis.position

        if ( this.fuelTank > 0 )
            this.wheelMovement(delta)
        else
            this.sendMessage(Messages.EMPTY_FUEL_TANK)

        this.sendMessage(Messages.CAR_MOVED, {
            carPosition: currentPos,
            carBounds: this.owner.getBounds(),
        })
    }

    onMessage(msg: ECS.Message) {
        if ( msg.action == Messages.REFUEL ) 
            this.fuelTank = Math.min(MAX_FUEL, this.fuelTank + FUEL_CANISTER_VOLUME)
    }

    getFuelTank() {
        return this.fuelTank
    }

    /**
     * Build car object
     * TODO not pretty
     */
    private buildCar() {
        const
            binder = this.props.binder,
            x = this.props.x,
            y = this.props.y,
            width = this.props.width,
            height = this.props.height,
            wheelSize = this.props.wheelSize,
            wheelbase = this.props.wheelbase,
            wheelOffset = this.props.wheelOffset


        const wheelDistance = width * 0.5 - wheelbase * 0.5,
            wheelFriction = 0.9,
            wheelDensity = 0.001,
            chassisDensity = 0.0015,
            car_group = Matter.Body.nextGroup(true);

        // Chassis
        const chassisBody = Matter.Bodies.rectangle(x, y, width - 20, height, { 
            label: "car_chassis",
            chamfer: {
                radius: height * 0.6
            },
            density: chassisDensity,
            collisionFilter: {
                group: car_group
            },
        })
        const chassis = binder.addBody(chassisBody)
        this.owner.addChild(chassis)

        this.chassis = chassis as PixiMatter.MatterBody

        // Chassis texture (NOT PRETTY)
        const chassisTexture = PIXI.Texture.from(Assets.CAR_CHASSIS)
        const chassisSprite = new PIXI.Sprite(chassisTexture)
        chassisSprite.anchor.set(0.48, 0.5);
        chassisSprite.x = chassis.position.x 
        chassisSprite.y = chassis.position.y
        chassisSprite.scale.x = width / chassisTexture.width
        chassisSprite.scale.y = height / chassisTexture.height
        chassis.addChild(chassisSprite);
        
        // Wheels
        const wheelFrontBody = Matter.Bodies.circle(x + wheelDistance, y + wheelOffset, wheelSize / 2, {
            label: "front_wheel",
            friction: wheelFriction / 2,
            density: wheelDensity * 2,
            collisionFilter: {
                group: car_group
            }
        })
        const wheelFront = binder.addBody(wheelFrontBody)
        this.owner.addChild(wheelFront)

        const wheelRearBody = Matter.Bodies.circle(x - wheelDistance, y + wheelOffset, wheelSize / 2, {
            label: "rear_wheel",
            friction: wheelFriction,
            density: wheelDensity,
            collisionFilter: {
                group: car_group
            }
        })
        const wheelRear = binder.addBody(wheelRearBody)
        this.owner.addChild(wheelRear)
            

        this.frontWheel = wheelFront as PixiMatter.MatterBody
        this.rearWheel = wheelRear as PixiMatter.MatterBody


        // Wheel textures (NOT PRETTY)
        const wheelTexture = PIXI.Texture.from(Assets.CAR_WHEEL)
        const wheelFrontSprite = new PIXI.Sprite(wheelTexture)
        wheelFrontSprite.anchor.set(0.5);
        wheelFrontSprite.x = wheelFront.position.x
        wheelFrontSprite.y = wheelFront.position.y
        wheelFrontSprite.scale.x = wheelSize / wheelTexture.width
        wheelFrontSprite.scale.y = wheelSize / wheelTexture.width
        wheelFront.addChild(wheelFrontSprite);

        const wheelRearSprite = new PIXI.Sprite(wheelTexture)
        wheelRearSprite.anchor.set(0.5);
        wheelRearSprite.x = wheelRear.position.x
        wheelRearSprite.y = wheelRear.position.y
        wheelRearSprite.scale.x = wheelSize / wheelTexture.width
        wheelRearSprite.scale.y = wheelSize / wheelTexture.width
        wheelRear.addChild(wheelRearSprite)


        
        // Wheel axles
        const frontAxle = binder.addConstraint(Matter.Constraint.create({
            bodyA: chassisBody,
            pointA: {x: wheelDistance, y: wheelOffset},
            bodyB: wheelFrontBody, 
            pointB: {x: 0, y: 0},
            length: 1,
            stiffness: 0.1,
            damping: 0.1
        }))

        const rearAxle = binder.addConstraint(Matter.Constraint.create({
            bodyA: chassisBody,
            pointA: {x: -wheelDistance, y: wheelOffset},
            bodyB: wheelRearBody, 
            pointB: {x: 0, y: 0},
            length: 1, 
            stiffness: 0.1,
            damping: 0.1

        }))
    }


    // Wheel movement
    private wheelMovement(delta: number) {
        let cmp = this.scene.stage.findComponentByName<ECS.KeyInputComponent>(ECS.KeyInputComponent.name)

        const oldVelocity = this.rearWheel.body.angularVelocity
        let newVelocity = oldVelocity
        const acceleration = CAR_ACCELERATION * delta


        if (cmp.isKeyPressed(ECS.Keys.KEY_LEFT))
            newVelocity = Math.max(-CAR_MAX_REVERSE_SPEED, oldVelocity - acceleration)
        if (cmp.isKeyPressed(ECS.Keys.KEY_RIGHT))
            newVelocity = Math.min(CAR_MAX_SPEED, oldVelocity + acceleration)

        if ( oldVelocity != newVelocity )
            this.fuelTank -= FUEL_CONSUMPTION



        Matter.Body.setAngularVelocity(this.frontWheel.body, newVelocity)
        Matter.Body.setAngularVelocity(this.rearWheel.body, newVelocity)
    }
}
