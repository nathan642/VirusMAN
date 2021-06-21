var WIDTH = window.innerWidth, HEIGHT = window.innerHeight;
        var aspectRatio = WIDTH / HEIGHT;
        var renderer = new THREE.WebGLRenderer()
        var camera = new THREE.PerspectiveCamera(10, aspectRatio, 0.1, 1000)
        var scene = new THREE.Scene();
        var controls = new THREE.OrbitControls(camera, renderer.domElement);
        var clock = new THREE.Clock(),text = document.createElement("div");
        controls.enableKeys = false;
        var audio = new Audio('assets/Corona.mp3');
        audio.play();

        var mov = 4;
        var delta = 1 / mov;
        var tetha = 0.0, edgeSize = 15, padding = 0.15;
        var cubeSize = edgeSize + (edgeSize - 1) * padding;
        var halfCubeSize = cubeSize/2;

        var BACKGROUND_COLOR = 0x00081e, 
            BODY_COLOR = 0xf8f8ff, 
            HEAD_COLOR = 0x00bfff, 
            score = 0;

        var lightPos = [new THREE.Vector3(0,50,20), 
                        new THREE.Vector3(0,15,-20), 
                        new THREE.Vector3(-20,15,20), 
                        new THREE.Vector3(20,-15,0)];

        var end = false, keysQueue = [];
            
        var snake = [], virus;
        var snake2, virus2;
        var cube = new THREE.BoxGeometry( 1, 1, 1 );

        //tampilan arena
        var gameCube = new THREE.BoxGeometry( cubeSize, cubeSize, cubeSize );
        const negx= new THREE.TextureLoader().load('assets/arena/negx.jpg');
        const negy= new THREE.TextureLoader().load('assets/arena/negy.jpg');
        const negz= new THREE.TextureLoader().load('assets/arena/negz.jpg');
        const posx= new THREE.TextureLoader().load('assets/arena/posx.jpg');
        const posy= new THREE.TextureLoader().load('assets/arena/posy.jpg');
        const posz= new THREE.TextureLoader().load('assets/arena/posz.jpg');
        const mat_array= [
            new THREE.MeshBasicMaterial({map:posx, side:THREE.BackSide}),
            new THREE.MeshBasicMaterial({map:negx, side:THREE.BackSide}),
            new THREE.MeshBasicMaterial({map:posy, side:THREE.BackSide}),
            new THREE.MeshBasicMaterial({map:negy, side:THREE.BackSide}),
            new THREE.MeshBasicMaterial({map:posz, side:THREE.BackSide}),
            new THREE.MeshBasicMaterial({map:negz, side:THREE.BackSide}),
        ]
        let mesh_saya= new THREE.Mesh(gameCube,mat_array);
        scene.add(mesh_saya);
        // end arena

        var direction = new THREE.Vector3(1, 0, 0);


        scene.background = new THREE.Color( BACKGROUND_COLOR );
        
        camera.position.z = 130;
        camera.position.y =0;
        camera.position.x =0;

        cube.center();

        function init(){

            renderer.setSize(WIDTH, HEIGHT);
            document.body.appendChild(renderer.domElement);

            lightPos.forEach(function(v){
                var light = new THREE.PointLight(0xffffff, 1, 100);
                light.position.set(v.x, v.y, v.z);
                scene.add(light)
            });
            
            //ukuran suntik
            for(var i = 0; i < 2; i++){
                var snakeCubeMaterial = new THREE.MeshPhongMaterial( { color: (i == 4) ? HEAD_COLOR : BODY_COLOR} );
                snake.push(new Cube( 
                    new THREE.Vector3((i + i * padding) -halfCubeSize + 0.5 , 0.5 + padding / 2, 0.5 + padding / 2 ), snakeCubeMaterial, scene));
            }
            //bentuk virus
            var virusCubeMaterial = new THREE.MeshPhongMaterial( { color: 0xff00ff, opacity:0, transparent:true} );
            virus = new Cube(spawnVirusVector(), virusCubeMaterial, scene);

            let loader= new THREE.GLTFLoader().load('model/covid-19/scene.gltf', function(result){
                virus2=result.scene.children[0];
                virus2.scale.set(0.09,0.09,0.09);
                virus2.position.copy(virus.mesh.position);
                scene.add(virus2);
            });
            let loader_snake= new THREE.GLTFLoader().load('model/megaman_virus_-_mettaur/scene.gltf', function(result2){
                snake2=result2.scene.children[0];
                snake2.scale.set(2,2,2);
                snake2.position.copy(snake[0].mesh.position);
                scene.add(snake2);
            });
            console.log(snake[0].mesh.position);
            // let virus = new THREE.GLTFLoader();
            // virus.load('model/covid-19/scene.gltf', function (virus2) {
            
            //     let vrs = virus2.scene.children[0];
            //     vrs.scale.set(100.0, 100.0, 100.0);
            //     // vrs.position.set(1550, -5100, 0);
            //     scene.add(vrs);
            // });

            //buntut
            var edgesMaterial = new THREE.LineBasicMaterial( { color: 0xffffff, opacity:0, transparent:true } );
            new Cube(new THREE.Vector3(0,0,0), edgesMaterial, scene, gameCube, true).setPosition(0,0,0);

            text.style.position = "absolute";
            text.style.fontFamily = "Algerian";
            text.style.width = 200;
            text.style.height = 100;
            text.style.color = "white";
            text.innerHTML = "kalahkan virus dan jadilah kuat!<br/><br/> control : <br/> w : depan <br/> s : belakang <br/> a : kiri <br/> d : kanan <br/> u : atas <br/> n : bawah </br></br>e : refresh game";
            text.style.top = 20 + "px";
            text.style.left = 20 + "px";
            text.style.fontSize = 50 + "px";

            document.body.appendChild(text);

            clock.startTime = 0.0;
            render();
        }

        function restart(){
            //fungsi ini berfungsi untuk setiap fungsi dipanggil akan menghapus box snake
            while(snake.length > 0) scene.remove(snake.shift().mesh);

            for(var i = 0; i < snake.length; i++){
                snake[i].setPosition((i + i * padding) -halfCubeSize + 0.5 , 0.5 + padding / 2, 0.5 + padding / 2 );
            }
            end = false;
            direction = new THREE.Vector3(1,0,0);
            text.style.color = "white";
            text.innerHTML = "virus: " + 0;
            score = 0;
        }

        document.onload = init();


        var lokasi_virus= spawnVirusVector();
        //tempat respon virus
        function spawnVirusVector(){
            var x = randInRange(0, edgeSize - 1), 
                y =  randInRange(0, edgeSize - 1), 
                z =  randInRange(0, edgeSize - 1);
            return new THREE.Vector3(x + x * padding -halfCubeSize + 0.5, 
                                     y + y * padding -halfCubeSize + 0.5, 
                                     z + z * padding -halfCubeSize + 0.5);
        }

        //function bentuk dari jangkauan map
        function Cube(vec, material, scene, geometry, renderWireframe){
            this.geometry = typeof geometry === 'undefined' ? cube : geometry;
            this.mesh = new THREE.Mesh(this.geometry, material);

            if(typeof renderWireframe === 'undefined' || !renderWireframe){
                this.mesh.position.set(vec.x, vec.y, vec.z);
                scene.add(this.mesh);
            }
            //sudut sudut yang membentuk kubusnya
            else {
                var edges = new THREE.EdgesGeometry( this.mesh.geometry );
                scene.add(new THREE.LineSegments( edges, material ));
            }

            this.setPosition = function(vec){
                this.mesh.position.set(vec.x, vec.y, vec.z);
            };
        }   

        function randInRange(a, b){
            return a + Math.floor((b - a) * Math.random());
        }

        function render(){
            requestAnimationFrame(render);
            
            tetha += clock.getDelta();
            
            if(tetha > delta){
                var tail = snake.shift();
                var head = snake[snake.length - 1];

                head.mesh.material.color.setHex(BODY_COLOR);
                tail.mesh.material.color.setHex(HEAD_COLOR);

                direction = keysQueue.length > 0 ? keysQueue.pop(0) : direction;
                var newPosition = new THREE.Vector3(head.mesh.position.x + direction.x + Math.sign(direction.x) * padding, 
                                                    head.mesh.position.y + direction.y + Math.sign(direction.y) * padding, 
                                                    head.mesh.position.z + direction.z + Math.sign(direction.z) * padding);
                tail.setPosition(newPosition);
                snake2.position.copy(head.mesh.position).y+=0.5;
                snake.push(tail);
                head = tail;

                for(var i = snake.length - 2; i > -1; i--){
                    if(head.mesh.position.distanceTo(snake[i].mesh.position) < 1){
                        end = true;
                        break;
                    }
                }

                if(end) {
                    restart();
                }
                if(head.mesh.position.distanceTo(virus.mesh.position) < 1){
                    virus.setPosition(spawnVirusVector());
                    virus2.position.copy(virus.mesh.position);

                    text.innerHTML = "virus: " + (++score);
                    
                    snake.unshift(new Cube( new THREE.Vector3(snake[0].mesh.position.x, 
                                                              snake[0].mesh.position.y, 
                                                              snake[0].mesh.position.z), 
                                                              new THREE.MeshPhongMaterial( { color: 0x388e3c} ), 
                                                              scene));

                }
                
                //      --CONTROL ULERNYA--
                if(head.mesh.position.x < -halfCubeSize){
                    head.mesh.position.x = halfCubeSize - 0.5;
                }
                else if(head.mesh.position.x > halfCubeSize){
                    head.mesh.position.x = -halfCubeSize + 0.5;
                }
                else if(head.mesh.position.y < -halfCubeSize){
                    head.mesh.position.y = halfCubeSize - 0.5;
                }
                else if(head.mesh.position.y > halfCubeSize){
                    head.mesh.position.y = -halfCubeSize + 0.5;
                }
                else if(head.mesh.position.z < -halfCubeSize){
                    head.mesh.position.z = halfCubeSize - 0.5;
                }
                else if(head.mesh.position.z > halfCubeSize){
                    head.mesh.position.z = -halfCubeSize + 0.5;
                }

                tetha = 0;
            }
            renderer.render(scene, camera);
        }
        let movement = new THREE.Vector3(0, 0, 0);
        const kiri = new THREE.Vector3(-1,0,0);
        const kanan = new THREE.Vector3(1,0,0);
        const depan = new THREE.Vector3(0,0,-1);
        const belakang = new THREE.Vector3(0,0,1);
        const atas = new THREE.Vector3(0,1,0);
        const bawah = new THREE.Vector3(0, -1, 0);
        document.addEventListener("keydown", function(control){
            switch(control.key){
                case 'u':
                    movement.add(atas);
                    keysQueue.push(atas);
                break;
                case 'n':
                    movement.add(bawah);
                    keysQueue.push(bawah);
                break;
                case "s":
                    movement.add(belakang);
                    keysQueue.push(belakang);
                break;
                case "w":
                    movement.add(depan);
                    keysQueue.push(depan);
                break;
                case "a":
                    movement.add(kiri);
                    keysQueue.push(kiri);
                break;
                case "d":
                    movement.add(kanan);
                    keysQueue.push(kanan);
                break;
                case "e":
                    location.replace('main.html');
                    
                break;
            }
            // let cameraMovement = new THREE.Vector3(0, 1, 120);
            // cameraMovement.add(movement);

            camera.position.copy(cameraMovement);
            console.log(keysQueue.position,cameraMovement.position);
        });