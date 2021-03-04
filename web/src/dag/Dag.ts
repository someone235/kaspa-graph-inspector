import * as PIXI from 'pixi.js'
import TimelineContainer from "./TimelineContainer";
import {Block} from "./model/Block";

export default class Dag {
    private readonly tickInternalInMilliseconds = 1000;
    private readonly headHeightMarginMultiplier = 0.5;

    private readonly application: PIXI.Application;
    private readonly timelineContainer: TimelineContainer;

    private currentWidth: number = 0;
    private currentHeight: number = 0;

    private targetHeight: number | null = null;

    private currentTickFunction: () => Promise<void> = async () => {
        // Do nothing
    };

    constructor(canvas: HTMLCanvasElement) {
        this.application = new PIXI.Application({
            transparent: false,
            backgroundColor: 0xffffff,
            view: canvas,
            resizeTo: canvas,
        });

        this.timelineContainer = new TimelineContainer(this.application);
        this.application.ticker.add(this.resizeIfRequired);
        this.application.stage.addChild(this.timelineContainer);

        this.application.start();

        this.resolveInitialTickFunction();
        this.start();
    }

    private resizeIfRequired = () => {
        if (this.currentWidth !== this.application.renderer.width
            || this.currentHeight !== this.application.renderer.height) {
            this.currentWidth = this.application.renderer.width;
            this.currentHeight = this.application.renderer.height;

            this.timelineContainer.recalculatePositions();
        }
    }

    private resolveInitialTickFunction = () => {
        const urlParams = new URLSearchParams(window.location.search);
        const targetHeightString = urlParams.get("targetHeight");
        if (targetHeightString) {
            const targetHeight = parseInt(targetHeightString);
            if (targetHeight) {
                this.targetHeight = targetHeight;
                this.currentTickFunction = this.trackTargetHeight;
                return;
            }
        }
        this.currentTickFunction = this.trackHead;
    }

    private start = () => {
        this.tick();
    }

    private tick = () => {
        this.currentTickFunction().then(this.scheduleNextTick);
    }

    private scheduleNextTick = () => {
        window.setTimeout(this.tick, this.tickInternalInMilliseconds);
    }

    private trackTargetHeight = async () => {
        const targetHeight = this.targetHeight as number;
        this.timelineContainer.setTargetHeight(targetHeight);

        const [startHeight, endHeight] = this.timelineContainer.getVisibleHeightRange(targetHeight);
        const response = await fetch(`http://localhost:3001/blocksBetweenHeights?startHeight=${startHeight}&endHeight=${endHeight}`);
        const blocks = await response.json();
        this.timelineContainer.insertOrIgnoreBlocks(blocks);
    }

    private trackHead = async () => {
        const maxBlockAmountOnHalfTheScreen = this.timelineContainer.getMaxBlockAmountOnHalfTheScreen();
        const headMargin = Math.floor(maxBlockAmountOnHalfTheScreen * this.headHeightMarginMultiplier);
        const heightDifference = maxBlockAmountOnHalfTheScreen + headMargin;

        const response = await fetch(`http://localhost:3001/head?heightDifference=${heightDifference}`);
        const blocks: Block[] = await response.json();

        let maxHeight = 0;
        for (let block of blocks) {
            if (block.height > maxHeight) {
                maxHeight = block.height;
            }
        }

        this.timelineContainer.setTargetHeight(maxHeight - headMargin);
        this.timelineContainer.insertOrIgnoreBlocks(blocks);
    }

    stop = () => {
        if (this.application) {
            this.application.stop();
        }
    }
}