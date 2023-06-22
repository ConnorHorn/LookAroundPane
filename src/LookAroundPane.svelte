<script>
    import { onMount, onDestroy } from 'svelte';
    import { writable } from 'svelte/store';
    import * as faceapi from 'face-api.js';

    let xMove = writable(0);
    let yMove = writable(0);

    let xMoveVal = 0;
    let yMoveVal = 0;
    let unsubsX, unsubsY;

    let scaleFactor = 1.4; // Change this to adjust the scale of the image

    let video;
    let displaySize;
    let faceDataStore = writable({x: null, y: null, width: null, height: null});

    async function startVideo() {
        video.srcObject = await navigator.mediaDevices.getUserMedia({ video: {} });
        await new Promise((resolve) => video.onloadedmetadata = resolve);
        video.play();
        console.log("Video started successfully");
        startFaceDetection();
    }

    async function startFaceDetection() {
        displaySize = { width: video.width, height: video.height };
        setInterval(async () => {
            console.log("In the detection interval");
            const detections = await faceapi.detectAllFaces(video, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.15 }));
            const resizedDetections = faceapi.resizeResults(detections, displaySize);
            if (resizedDetections[0]) {
                console.log("Face detected", resizedDetections[0]);
                const { x, y, width, height } = resizedDetections[0].box;
                faceDataStore.set({x, y, width, height});
                xMove.set(-(x + width/2 - 360)/360); // Invert the X direction
                yMove.set((y + height/2 - 360)/360);
            }
        }, 100);
    }

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

    // Compute transform style, taking into account scaleFactor and aspect ratio
    $: transformStyle = `translate(calc(${xMoveVal * (50 * scaleFactor - 50)}vw - 50%), calc(${yMoveVal * (50 * scaleFactor - 50)}vh - 50%)) scale(${scaleFactor})`;

    onMount(async () => {
        await faceapi.nets.ssdMobilenetv1.loadFromUri('/models');
        console.log("Models loaded successfully");
        startVideo();
    });
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
        transition: transform 1s cubic-bezier(0.23, 1, 0.32, 1);
        z-index: 1;
        object-fit: cover;
    }
</style>

<video bind:this={video} style="position: absolute; object-fit: fill;" id="video" width="720" height="720" autoplay muted playsinline></video>
<img src="/static/images/citySkyline.jpg" alt="Immersive Display Image" class="image-display" style="--transformStyle: {transformStyle}" />
