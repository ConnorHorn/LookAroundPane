<script>
    import {onMount, onDestroy} from 'svelte';
    import {xMove, yMove} from './stores.js';

    let xMoveVal = 0;
    let yMoveVal = 0;
    let unsubsX, unsubsY;

    onMount(() => {
        unsubsX = xMove.subscribe(value => {
            xMoveVal = value;
        });

        unsubsY = yMove.subscribe(value => {
            yMoveVal = value;
        });
    });

    onDestroy(() => {
        unsubsX();
        unsubsY();
    });

    $: transformStyle = `translate(calc(${-xMoveVal * 50}% - 50%), calc(${yMoveVal * 50}% - 50%)) scale(2)`;
</script>

<style>
    .image-display {
        position: fixed;
        top: 50%;
        left: 50%;
        width: 100vw;
        height: 100vh;
        transform-origin: center center;
        transform: var(--transformStyle);
        transition: transform 1s cubic-bezier(0.23, 1, 0.32, 1); /* adjust for smoother transition */
        z-index: 1; /* ensure the image stays on top */
        object-fit: cover; /* scale image to cover entire screen while maintaining aspect ratio */
    }
</style>

<img src="/static/images/citySkyline.jpg" alt="Immersive Display Image" class="image-display"
     style="--transformStyle: {transformStyle}"/>