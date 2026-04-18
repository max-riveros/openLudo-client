import { BoardHandle } from "../../components/game/Board";
import { PawnData, PawnHandle } from "../../components/game/Pawn";


class Pawn {
    private linearPos: number = 0;
    private boardLength: number = 52;
    private isAtGoalArea: boolean = false;
    private isDead: boolean = true;
    constructor(
        readonly handle: PawnHandle, 
        readonly startPos: { x: number, y: number },
        readonly homePos: { x: number, y: number },
        readonly goalDirection: { up: number, left: number },
        readonly goalEntryLinearPos: number,
    ) {
    }

    public getX() {
        return this.handle.getX();
    }
    public getY() {
        return this.handle.getY();
    }

    public async moveTo(x: number, y: number) {
        await this.handle.move(this.getY() - y, this.getX() - x, false);
    }

    public async kill() {
        await this.moveToStart();
        this.isDead = true;
        await this.moveTo(this.homePos.x, this.homePos.y);
    }

    public async revive() {
        this.isDead = false;
        this.linearPos = this.goalEntryLinearPos + 2;
        if (this.linearPos >= this.boardLength) this.linearPos -= this.boardLength;
        this.moveTo(this.startPos.x, this.startPos.y);
    }

    public async moveToStart() {
        if (this.isDead) return;
        while (this.getX() != this.startPos.x || this.getY() != this.startPos.y) {
            await this.moveOnce(true);
        }
    }

    public async moveToGoalArea(position: number) {
        if (this.isDead) return;
        if (!this.isAtGoalArea) {
            await this.moveToLinearPosition(this.goalEntryLinearPos);
            await this.handle.move(this.goalDirection.up, this.goalDirection.left, true);
            this.linearPos = 0;
            this.isAtGoalArea = true;
        }
        while (this.linearPos < position) {
            this.linearPos++;
            await this.handle.move(this.goalDirection.up, this.goalDirection.left, true);
        }
    }

    public async moveToLinearPosition(position: number) {
        if (this.isDead || position >= this.boardLength || position < 0) return;
        while (this.linearPos != position) {
            await this.moveOnce(false);
        }
    }

    public async move(times: number) {
        if (this.isDead) return;
        for (let i = 0; i < times; i++) {
            await this.moveOnce(false);
        }
    }

    private async moveOnce(fast: boolean) {
        this.linearPos++;
        if (this.linearPos == this.boardLength) this.linearPos = 0;
        if (this.getY() == 6) {
            if (this.getX() == 5) {
                await this.handle.move(1, -1, fast);
            } else if (this.getX() == 14) {
                await this.handle.moveDown(1, fast);
            } else {
                await this.handle.moveRight(1, fast);
            }
        } else if (this.getX() == 6) {
            if (this.getY() == 0) {
                await this.handle.moveRight(1, fast);
            } else if (this.getY() == 9) {
                await this.handle.move(1, 1, fast);
            } else {
                await this.handle.moveDown(-1, fast);
            }
        } else if(this.getX() == 7) {
            if (this.getY() < 7) {
                await this.handle.moveRight(1, fast);
            } else if (this.getY() > 7) {
                await this.handle.moveRight(-1, fast);
            }
        } else if (this.getX() == 8) {
            if (this.getY() == 5) {
                await this.handle.move(-1, -1, fast);
            } else if (this.getY() == 14) {
                await this.handle.moveRight(-1, fast);
            } else {
                await this.handle.moveDown(1, fast);
            }
        } else if (this.getY() == 7) {
            if (this.getX() > 7) {
                await this.handle.moveDown(1, fast);
            } else if (this.getX() < 7) {
                await this.handle.moveDown(-1, fast);
            }
        } else if (this.getY() == 8) {
            if (this.getX() == 9) {
                await this.handle.move(-1, 1, fast);
            } else if (this.getX() == 0) {
                await this.handle.moveDown(-1, fast);
            } else {
                await this.handle.moveRight(-1, fast);
            }
        }
    }
}

const redHomePositions = [
    { x: 1.5, y: 3.5 },
    { x: 1.5, y: 1.5 },
    { x: 3.5, y: 3.5 },
    { x: 3.5, y: 1.5 },
];
const blueHomePositions = [
    { x: 10.5, y: 1.5 },
    { x: 12.5, y: 1.5 },
    { x: 10.5, y: 3.5 },
    { x: 12.5, y: 3.5 },
];
const yellowHomePositions = [
    { x: 12.5, y: 10.5 },
    { x: 10.5, y: 10.5 },
    { x: 12.5, y: 12.5 },
    { x: 10.5, y: 12.5 },
];
const greenHomePositions = [
    { x: 3.5, y: 12.5 },
    { x: 1.5, y: 12.5 },
    { x: 3.5, y: 10.5 },
    { x: 1.5, y: 10.5 },
]

export class PawnController {
    private pawns: Pawn[] = [];
    private redPawnCount: number = 0;
    private bluePawnCount: number = 0;
    private yellowPawnCount: number = 0;
    private greenPawnCount: number = 0;
    constructor(readonly board: BoardHandle) { }

    public addPawn(data: PawnData, endPosition: number) {
        this.board.addPawn(data, (handle) => {
            let startPos;
            let homePos;
            let goalDirection;
            switch (data.color) {
                case "red":
                    startPos = { x: 1, y: 6 };
                    homePos = redHomePositions[this.redPawnCount];
                    this.redPawnCount++;
                    goalDirection = { up: 0, left: -1 };
                    break;

                case "blue":
                    startPos = { x: 8, y: 1 };
                    homePos = blueHomePositions[this.bluePawnCount];
                    this.bluePawnCount++;
                    goalDirection = {up: -1, left: 0}
                    break;

                case "yellow":
                    startPos = { x: 13, y: 8 };
                    homePos = yellowHomePositions[this.yellowPawnCount];
                    this.yellowPawnCount++;
                    goalDirection = {up: 0, left: 1}
                    break;

                case "green":
                    startPos = { x: 6, y: 13 };
                    homePos = greenHomePositions[this.greenPawnCount];
                    this.greenPawnCount++;
                    goalDirection = {up: 1, left: 0}
                    break;
            }
            const pawn = new Pawn(handle, startPos, homePos, goalDirection, endPosition);
            pawn.kill();
            this.pawns[data.id] = pawn;
        });
    }
    public getPawn(id: number) {
        return this.pawns[id];
    }
}
