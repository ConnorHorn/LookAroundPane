<script>
    import { afterUpdate, onMount } from 'svelte';
    import { writable } from 'svelte/store';
    import * as faceapi from 'face-api.js';
    import {xMove, yMove} from "./stores";

    let video;
    let displaySize;
    let faceDataStore = writable({x: null, y: null, width: null, height: null});

    async function startVideo() {
        let stream = await navigator.mediaDevices.getUserMedia({ video: {} });
        video.srcObject = stream;
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
                // console.log(`Center of face: (${x + width/2}, ${y + height/2})`);  // Log the coordinates
                $xMove=(x + width/2 - 360)/360;
                $yMove=(y + height/2 - 360)/360;
                console.log($xMove + " " + $yMove);
            }
        }, 100);
    }

    onMount(async () => {
        await faceapi.nets.ssdMobilenetv1.loadFromUri('/models');
        console.log("Models loaded successfully");
        startVideo();
    });
</script>

<div>
    <video bind:this={video} style="position: absolute; object-fit: fill;" id="video" width="720" height="720" autoplay muted playsinline></video>
    {#if $faceDataStore.x && $faceDataStore.y}
<!--        <div style="position: absolute; top: {$faceDataStore.y + $faceDataStore.height/2}px; left: {$faceDataStore.x + $faceDataStore.width/2}px;">-->
<!--            <svg height="100" width="100">-->
<!--                <circle cx="50" cy="50" r="40" stroke="red" stroke-width="3" fill="red" />-->
<!--            </svg>-->
<!--        </div>-->
    {/if}
</div>
