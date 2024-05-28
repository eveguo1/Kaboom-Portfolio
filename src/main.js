import { scaleFactor, dialogueData } from "./constant";
import { k } from "./kaboomCtx";
import { displayDialogue, setCamScale } from "./utils";

k.loadSprite("spritesheet", "./spritesheet.png", {
    sliceX: 39,
    sliceY: 31,
    anims: {
        "idle-down": 936,
        "walk-down": { from: 936, to: 939, loop: true, speed: 8 },
        "idle-right": 975,
        "walk-right": { from: 975, to: 978, loop: true, speed: 8 },
        "idle-up": 1014,
        "walk-up": { from: 1014, to: 1017, loop: true, speed: 8 },
        "idle-left": 1053,
        "walk-left": { from: 1053, to: 1056, loop: true, speed: 8 },
    },
});

k.loadSprite("map", "./map.png");

k.setBackground(k.Color.fromHex("#311047"));

k.scene("main", async () => {
    // read json file, await is to ensure the file is fully processed before we move on
    const mapData = await (await fetch("./map.json")).json();
    const layers = mapData.layers;

    // create the first game object, 'make' is to create game object but not to display it, while 'add' will create game object and add to the scene
    const map = k.add([
        // use sprite component to pass the key we want to display, map is declared above on line 18
        k.sprite("map"),
        k.pos(0), // set position
        k.scale(scaleFactor) // scale object bigger
    ]);
    // create game object player
    const player = k.make([
        k.sprite("spritesheet", { anim: "idle-down" }),
        k.area({ // create hit box automatically for the game object
            shape: new k.Rect(k.vec2(0, 3), 10, 10), // create shape of rectangle that is 3 from center
        }),
        k.body(),
        k.anchor("center"), // draw our player at the center
        k.pos(),
        k.scale(scaleFactor),
        {
            speed: 250,
            direction: "down",
            isInDialogue: false,
        },
        "player",
    ]);

    for (const layer of layers) {
        if (layer.name === "boundaries") {
            for (const boundary of layer.objects) {
                map.add([
                    k.area({
                        shape: new k.Rect(k.vec2(0), boundary.width, boundary.height),
                    }),
                    k.body({ isStatic: true }),
                    k.pos(boundary.x, boundary.y),
                    boundary.name
                ]);

                if (boundary.name) {
                    player.onCollide(boundary.name, () => {
                        player.isInDialogue = true;
                        displayDialogue(
                            dialogueData[boundary.name],
                            () => (player.isInDialogue = false)
                        );
                    });
                }
            }
            continue;
        }

        if (layer.name === "spawnpoints") {
            for (const entity of layer.objects) {
                if (entity.name === "player") {
                    player.pos = k.vec2(
                        (map.pos.x + entity.x) * scaleFactor,
                        (map.pos.y + entity.y) * scaleFactor
                    );
                    k.add(player);
                    continue;
                }
            }
        }
    }

    setCamScale(k);

    k.onResize(() => {
        setCamScale(k);
    });

    k.onUpdate(() => {
        k.camPos(player.pos.x, player.pos.y + 100);
    });

    k.onMouseDown((mouseBtn) => {
        if (mouseBtn !== "left" || player.isInDialogue) return;

        const worldMousePos = k.toWorld(k.mousePos());
        player.moveTo(worldMousePos, player.speed);

        const mouseAngle = player.pos.angle(worldMousePos);

        const lowerBound = 50;
        const upperBound = 125;

        if (mouseAngle > lowerBound &&
            mouseAngle < upperBound &&
            player.curAnim() !== "walk-up"
        ) {
            player.play("walk-up");
            player.direction = "up";
            return;
        }

        if (mouseAngle < -lowerBound &&
            mouseAngle > -upperBound &&
            player.curAnim() !== "walk-down"
        ) {
            player.play("walk-down");
            player.direction = "down";
            return;
        }

        if (Math.abs(mouseAngle) > upperBound) {
            if (player.curAnim() !== "walk-right") player.play("walk-right");
            player.direction = "right";
            return;
        }

        if (Math.abs(mouseAngle) < lowerBound) {
            if (player.curAnim() !== "walk-left") player.play("walk-left");
            player.direction = "left";
            return;
        }
    });

    k.onMouseRelease(() => {
        if (player.direction === "down") {
            player.play("idle-down");
            return;
        }
        if (player.direction === "up") {
            player.play("idle-up");
            return;
        }
        if (player.direction === "left") {
            player.play("idle-left");
            return;
        }
        if (player.direction === "right") {
            player.play("idle-right");
            return;
        }
    });
});

k.go("main");