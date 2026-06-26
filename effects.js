let threeScene;
let threeCamera;
let threeRenderer;

let currentEffect = null;
let animationId = null;

function initThree(){
    if (threeScene && threeCamera && threeRenderer) return;

    threeScene =
    new THREE.Scene();

    threeCamera =
    new THREE.PerspectiveCamera(
        75,
        window.innerWidth/
        window.innerHeight,
        0.1,
        1000
    );

    threeCamera.position.z =
    5;

    threeRenderer =
    new THREE.WebGLRenderer({
        alpha:true,
        antialias:true
    });

    threeRenderer.setSize(
        window.innerWidth,
        window.innerHeight
    );

    threeRenderer.domElement.style.cssText = `
        position:fixed;
        inset:0;
        width:100vw;
        height:100vh;
        display:block;
        pointer-events:none;
        z-index:0;
    `;

    document.body.appendChild(
        threeRenderer.domElement
    );

    window.addEventListener(
        "resize",
        ()=>{

            threeCamera.aspect =
            window.innerWidth/
            window.innerHeight;

            threeCamera.updateProjectionMatrix();

            threeRenderer.setSize(
                window.innerWidth,
                window.innerHeight
            );
        }
    );
}

function ensureThreeReady(){
    if (threeScene && threeCamera && threeRenderer) return true;
    if (!document.body) return false;
    initThree();
    return !!(threeScene && threeCamera && threeRenderer);
}

function clearScene(){

    if (animationId !== null) {
        cancelAnimationFrame(
            animationId
        );
        animationId = null;
    }

    if (!threeScene) return;

    while(
        threeScene.children.length
    ){

        const obj =
        threeScene.children[0];

        if(obj.geometry)
            obj.geometry.dispose();

        if(obj.material){

            if(
                Array.isArray(
                    obj.material
                )
            ){

                obj.material.forEach(
                    m=>m.dispose()
                );

            }else{

                obj.material.dispose();
            }
        }

        threeScene.remove(
            obj
        );
    }

    currentEffect = null;
}

function triggerDomainExpansion(name){

    if (!ensureThreeReady()) return;

    switch(name){

        case "unlimited_void":
            triggerUnlimitedVoid();
            break;

        case "malevolent_shrine":
            triggerMalevolentShrine();
            break;

        case "chimera_shadow":
            triggerChimeraShadow();
            break;

        case "time_strike":
            triggerTimeStrike();
            break;
    }
}

function dismissEffect(){

    if (!ensureThreeReady()) return;

    clearScene();

    threeRenderer.setClearColor(
        0x000000,
        0
    );
}

document.addEventListener(
    "DOMContentLoaded",
    initThree
);