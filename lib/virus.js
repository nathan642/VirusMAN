var WIDTH = window.innerWidth
var HEIGHT = window.innerHeight;
var aspectRatio = WIDTH / HEIGHT;
var renderer = new THREE.WebGLRenderer()
var camera = new THREE.PerspectiveCamera(45, aspectRatio, 0.1, 1000)
var scene = new THREE.Scene();
var controls = new THREE.OrbitControls(camera, renderer.domElement);
var clock = new THREE.Clock(), text = document.createElement("div");
controls.enableKeys = false;

var mov = 5;
var delta = 1 / mov;
var tetha = 15.0, edgeSize = 15, padding = 0.15;
var cubeSize = edgeSize + (edgeSize - 1) * padding;
var halfCubeSize = cubeSize/2;

        var BACKGROUND_COLOR = 0x606060, 
            BODY_COLOR = 0xf8f8ff, 
            HEAD_COLOR = 0x00bfff, 
            score = 0;

        var lightPos = [new THREE.Vector3(0,50,20), 
                        new THREE.Vector3(0,15,-20), 
                        new THREE.Vector3(-20,15,20), 
                        new THREE.Vector3(20,-15,0)];

        var end = false, keysQueue = [];
            
        var snake = [], virus;
        var cube = new THREE.BoxGeometry( 1, 1, 1 );
        var gameCube = new THREE.BoxGeometry( cubeSize, cubeSize, cubeSize );
        var direction = new THREE.Vector3(1, 0, 0);


        scene.background = new THREE.Color( BACKGROUND_COLOR );

        camera.position.z = 45;
        camera.position.y = 1;

        cube.center();

        function init(){

            renderer.setSize(WIDTH, HEIGHT);
            document.body.appendChild(renderer.domElement);

            lightPos.forEach(function(v){
                var light = new THREE.PointLight(0xffffff, 1, 100);
                light.position.set(v.x, v.y, v.z);
                scene.add(light)
            });

            for(var i = 0; i < 5; i++){
                var snakeCubeMaterial = new THREE.MeshPhongMaterial( { color: (i == 4) ? HEAD_COLOR : BODY_COLOR} );
                snake.push(new Cube( new THREE.Vector3((i + i * padding) -halfCubeSize + 0.5 , 0.5 + padding / 2, 0.5 + padding / 2 ), snakeCubeMaterial, scene));
            }
            
            //bentuk virus
            var virusCubeMaterial = new THREE.MeshPhongMaterial( { color: 0xff00ff} );
            virus = new Cube(spawnVirusVector(), virusCubeMaterial, scene);
            var edgesMaterial = new THREE.LineBasicMaterial( { color: 0xffffff } );
            new Cube(new THREE.Vector3(0,0,0), edgesMaterial, scene, gameCube, true).setPosition(0,0,0);

            text.style.position = "absolute";
            text.style.fontFamily = "Garamond, serif";
            text.style.width = 200;
            text.style.height = 100;
            text.innerHTML = "kalahkan virus dan jadilah kuat!";
            text.style.top = 20 + "px";
            text.style.left = 20 + "px";
            text.style.fontSize = 50 + "px";

            document.body.appendChild(text);

            clock.startTime = 0.0;
            render();
        }

        function restart(){
            while(snake.length > 5) scene.remove(snake.shift().mesh);

            for(var i = 0; i < snake.length; i++){
                snake[i].setPosition((i + i * padding) -halfCubeSize + 0.5 , 0.5 + padding / 2, 0.5 + padding / 2 );
            }
            end = false;
            direction = new THREE.Vector3(1,0,0);
            text.innerHTML = "virus: " + 0;
            score = 0;
        }

        document.onload = init();


        function spawnVirusVector(){
            var x = randInRange(0, edgeSize - 1), 
                y =  randInRange(0, edgeSize - 1), 
                z =  randInRange(0, edgeSize - 1);
            return new THREE.Vector3(x + x * padding -halfCubeSize + 0.5, 
                                     y + y * padding -halfCubeSize + 0.5, 
                                     z + z * padding -halfCubeSize + 0.5);
        }

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

        document.addEventListener("keydown", function(e){
            switch(e.key){
                case 'u':
                    keysQueue.push(new THREE.Vector3(0,1,0));
                break;
                case 'p':
                    keysQueue.push(new THREE.Vector3(0,-1,0));
                break;
                case "s":
                    keysQueue.push(new THREE.Vector3(0,0,1));
                break;
                case "w":
                    keysQueue.push(new THREE.Vector3(0,0,-1));
                break;
                case "a":
                    keysQueue.push(new THREE.Vector3(-1,0,0));
                break;
                case "d":
                    keysQueue.push(new THREE.Vector3(1,0,0));
                break;
            }
        });