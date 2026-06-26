let voidParticles = null;
let voidVelocities = [];
let voidDisk = null;
let voidDisk2 = null;
let voidHorizon = null;

function triggerUnlimitedVoid(){

    clearScene();

    currentEffect = "unlimited_void";

    threeScene.fog =
    new THREE.FogExp2(
        0x000814,
        0.02
    );

    //////////////////////////////////////////////////
    // LIGHTS
    //////////////////////////////////////////////////

    const ambient =
    new THREE.AmbientLight(
        0x4466ff,
        1.2
    );

    threeScene.add(
        ambient
    );

    const light =
    new THREE.PointLight(
        0x88ccff,
        120,
        300
    );

    threeScene.add(
        light
    );

    //////////////////////////////////////////////////
    // EVENT HORIZON
    //////////////////////////////////////////////////

    voidHorizon =
    new THREE.Mesh(

        new THREE.SphereGeometry(
            5,
            64,
            64
        ),

        new THREE.MeshPhysicalMaterial({
            color:0x000000,
            roughness:0,
            metalness:1
        })

    );

    threeScene.add(
        voidHorizon
    );

    //////////////////////////////////////////////////
    // ACCRETION DISKS
    //////////////////////////////////////////////////

    voidDisk =
    new THREE.Mesh(

        new THREE.TorusGeometry(
            11,
            3.5,
            32,
            128
        ),

        new THREE.MeshBasicMaterial({
            color:0x88ccff
        })

    );

    voidDisk.rotation.x =
    Math.PI/2;

    threeScene.add(
        voidDisk
    );

    voidDisk2 =
    new THREE.Mesh(

        new THREE.TorusGeometry(
            15,
            2,
            32,
            128
        ),

        new THREE.MeshBasicMaterial({
            color:0x66aaff
        })

    );

    voidDisk2.rotation.x =
    Math.PI/2;

    threeScene.add(
        voidDisk2
    );

    //////////////////////////////////////////////////
    // PARTICLES
    //////////////////////////////////////////////////

    const COUNT = 25000;

    const positions =
    new Float32Array(
        COUNT*3
    );

    voidVelocities = [];

    for(let i=0;i<COUNT;i++){

        const r =
        25 +
        Math.random()*120;

        const a =
        Math.random()*Math.PI*2;

        const x =
        Math.cos(a)*r;

        const y =
        (Math.random()-0.5)*8;

        const z =
        Math.sin(a)*r;

        positions[i*3] = x;
        positions[i*3+1] = y;
        positions[i*3+2] = z;

        voidVelocities.push({

            vx:-z/r*0.6,
            vy:0,
            vz:x/r*0.6

        });
    }

    const geo =
    new THREE.BufferGeometry();

    geo.setAttribute(

        "position",

        new THREE.BufferAttribute(
            positions,
            3
        )

    );

    voidParticles =
    new THREE.Points(

        geo,

        new THREE.PointsMaterial({

            color:0xffffff,
            size:0.08

        })

    );

    threeScene.add(
        voidParticles
    );

    //////////////////////////////////////////////////
    // ANIMATION
    //////////////////////////////////////////////////

    function animateVoid(time){

        if(
            currentEffect !==
            "unlimited_void"
        ) return;

        animationId =
        requestAnimationFrame(
            animateVoid
        );

        const t =
        time*0.001;

        threeCamera.position.x =
        Math.cos(t*0.12)*40;

        threeCamera.position.z =
        Math.sin(t*0.12)*40;

        threeCamera.position.y =
        6 +
        Math.sin(t*0.3)*2;

        threeCamera.lookAt(
            0,
            0,
            0
        );

        voidDisk.rotation.z +=
        0.002;

        voidDisk2.rotation.z -=
        0.001;

        const pos =
        voidParticles.geometry
        .attributes.position.array;

        for(
            let i=0;
            i<voidVelocities.length;
            i++
        ){

            let x =
            pos[i*3];

            let y =
            pos[i*3+1];

            let z =
            pos[i*3+2];

            const v =
            voidVelocities[i];

            const dx=-x;
            const dy=-y;
            const dz=-z;

            const r =
            Math.sqrt(
                dx*dx+
                dy*dy+
                dz*dz
            );

            const ux=dx/r;
            const uy=dy/r;
            const uz=dz/r;

            const gravity =
            120000/
            (r*r+100);

            v.vx+=ux*gravity;
            v.vy+=uy*gravity;
            v.vz+=uz*gravity;

            const tx =
            -dz/r;

            const tz =
             dx/r;

            const orbit =
            45000/
            (r+20);

            v.vx +=
            tx*orbit*0.0015;

            v.vz +=
            tz*orbit*0.0015;

            x+=v.vx;
            y+=v.vy;
            z+=v.vz;

            if(r<6){

                const nr=
                100+
                Math.random()*80;

                const na=
                Math.random()*Math.PI*2;

                x=
                Math.cos(na)*nr;

                y=
                (Math.random()-0.5)*8;

                z=
                Math.sin(na)*nr;
            }

            pos[i*3]=x;
            pos[i*3+1]=y;
            pos[i*3+2]=z;
        }

        voidParticles.geometry
        .attributes.position
        .needsUpdate = true;

        threeRenderer.render(
            threeScene,
            threeCamera
        );
    }

    animateVoid(0);
}