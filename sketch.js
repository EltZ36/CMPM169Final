let img;
let table;
let posX = 0;
let posY = 0;
let moveSpeed = 5;
let selectedLocations = [];
let emitterArray = [];
let fireShader;
let fireTexture;
let emitter; 
let partX = 0
let partY = 0
let is3DMode = false; // Flag for 3D mode
let image_x;
let image_y;
let zoom = 0.01
let image_width
let image_height 
let zoomLevel = 1.0

const fireArray = [[217, 96, 0], [230, 106, 0], [242, 117, 0], [255, 127, 0], [255, 137, 22], [255, 148, 36], [255, 159, 49]]
let clickedArray = [] 
let nameArray = [];

//from gpt asking about mapping coordinates to california 
const mapBounds = {
  top: 42,         // Northernmost latitude
  bottom: 32.5,    // Southernmost latitude
  left: -124.5,    // Westernmost longitude
  right: -114     // Easternmost longitude
};

function preload() {
    img = loadImage('cali1.png');
    table = loadTable('output.csv', 'csv', 'noHeader');
    fireShader = loadShader('fire.vert', 'fire.frag');
    newFont = loadFont('Arimo-Regular.ttf')
    locationNames = loadStrings('locations.txt');
}


function setup() {
    createCanvas(2000, 2000, WEBGL);
    img.resize(img.width * 2, img.height * 2);
    image_width = img.width 
    image_height = img.height
    generateFifty()
    //snippet from https://itp-xstory.github.io/p5js-shaders/#/./docs/examples/shaders_to_shapes 
    fireTexture = createGraphics(2000, 2000, WEBGL);
    fireTexture.noStroke(); 
}

function generateFifty(){
    let totalRows = table.getRowCount();
    while (selectedLocations.length < 50) {
        let randIndex = floor(random(0, totalRows));
        if (selectedLocations.includes(randIndex) == false) {
            selectedLocations.push(randIndex);
            nameArray.push(locationNames[randIndex])
            clickedArray.push(false)
        }
    }
    for(let i = 0; i < 50; i++){
        emitterArray.push(new Emitter(0, 0))
    }
}

function draw() {
    background(240);

    if (is3DMode) {
        // Handle image rotation
        if (mouseIsPressed) {
            let deltaX = mouseX - lastMouseX;
            let deltaY = mouseY - lastMouseY;
            rotationY += deltaX * 0.01;
            rotationX -= deltaY * 0.01;
        }
        lastMouseX = mouseX;
        lastMouseY = mouseY;
        
        // Apply rotations
        rotateX(rotationX);
        rotateY(rotationY);
    } else {
        rotationX = 0;
        rotationY = 0;
    }

    //fill(0, 255, 0)
    //for webgl, https://stackoverflow.com/questions/26110959/p5-js-loadfont-function
    textSize(10)
    textFont(newFont);
    //https://natureofcode.com/particles/ 
    blendMode(ADD);
    clear();
    //https://itp-xstory.github.io/p5js-shaders/#/./docs/examples/shaders_to_shapes 
    fireTexture.shader(fireShader);
    fireShader.setUniform("iResolution", [width, height]);
    //fireShader.setUniform("iResolution", [fireTexture.width, fireTexture.height]);
    fireShader.setUniform('iTime', millis() / 5000.0);
    fireShader.setUniform("iFrame", frameCount);
    fireShader.setUniform("iMouse", [mouseX, map(mouseY, 0, height, height, 0)]);
    fireTexture.ellipse(0, 0, fireTexture.width, fireTexture.height);    

    image_x = posX - width / 2;
    image_y = posY - height / 2;
    
    //from gpt asking about zooming into image and making sure that the locations are scaled properly
    //push();
    //scale(zoomLevel); // Apply zoom
    //image(img, image_x / zoomLevel, image_y / zoomLevel);
    image(img, image_x, image_y)
    drawLocations();
    //pop();
    
    if (keyIsDown(LEFT_ARROW)) {
        posX += moveSpeed;
    } 
    if (keyIsDown(RIGHT_ARROW)) {
        posX -= moveSpeed;
    } 
    if (keyIsDown(UP_ARROW)) {
        posY += moveSpeed;
    } 
    if (keyIsDown(DOWN_ARROW)) {
        posY -= moveSpeed;
    }

    //from gpt asking about scrolling image across canvas
    let halfWidth = img.width / 2 + 2000;
    let halfHeight = img.height / 2 + 2000;
    let minX = -halfWidth + width / 2;
    let maxX = halfWidth - width / 2;
    let minY = -halfHeight + height / 2;
    let maxY = halfHeight - height / 2;

    posX = constrain(posX, minX, maxX);
    posY = constrain(posY, minY, maxY);

    //background(240);
    //console.log('position x is ', posX);
    //console.log('position y is ', posY);
    //console.log('image x is ', image_x);
    //console.log('image_y is ', image_y);  
} 


//mapping function from gpt 
function drawLocations() {
    fill(255, 0, 0);
    noStroke()
    for (let i = 0; i < selectedLocations.length; i++) {
        let r = selectedLocations[i];
        let c = nameArray[i]
        //longitude and latitude 
        let lat = table.getString(r, 0);
        let lon = table.getString(r, 1);

        if (lat && lon) {
            //nan checking to make sure its correct 
            lat = parseFloat(lat);
            lon = parseFloat(lon);

            if (!isNaN(lat) && !isNaN(lon)) {
                let x = map(lon, mapBounds.left, mapBounds.right, 0, img.width);
                let y = map(lat, mapBounds.top, mapBounds.bottom, 0, img.height);
                            
                //run the emitter stuff 
                //addon from gpt for the zoom in 
                let emitterX = (x + posX - width / 2) / zoomLevel;
                let emitterY = (y + posY - height / 2) / zoomLevel;

                //resetMatrix(); // Reset transformations for particles
                //from nature of code in the draw loop
                let dx = map(mouseX, 0, width, -0.2, 0.2);
                let dy = map(mouseY, 0, height, -0.2, 0);
                let windX = createVector(dx, 0);
                let windY = createVector(0, dy);
                emitterArray[i].vector.set(x, y)
                emitterArray[i].run();

                //emitterArray[i].run()
                
                for(let j = 0; j < 2; j++){
                    emitterArray[i].addParticle()
                } 

                //apply the texture 
                //resetMatrix();
                texture(fireTexture)
                ellipse(x + posX - width / 2, y + posY - height / 2, 450, 450);

                //gpt asking about clicking on ellipse for input
                if(clickedArray[i] == true){
                    fill(0)
                    let coordString = lat.toString() + "," + lon.toString()
                    text(coordString, x + posX - width/2 + 50, y + posY - height/2 - 30)
                    text(c, x + posX - width/2 + 50, y + posY - height/2 - 50 )
                    emitterArray[i].applyForce(windX);
                    emitterArray[i].applyForce(windY);
                }
                //console.log(`Drawing ellipse at (${x + posX - width / 2}, ${y + posY - height / 2})`);
            } 
            else {
                console.error(`Invalid lat/lon for row ${r}: (${lat}, ${lon})`);
            }
        } 
        else {
            console.error(`Missing lat/lon for row ${r}`);
        }
    }
}

//make it so that you can adjust the fire and wind when you click on the circle 
function mousePressed(){
    for(let i = 0; i < selectedLocations.length; i++){
        let r = selectedLocations[i]
        let lat = table.getString(r, 0);
        let lon = table.getString(r, 1);
        let comboString = lat + ", " + lon
        //from gpt asking about mouse clicking on location 
        let x = map(lon, mapBounds.left, mapBounds.right, 0, img.width);
        let y = map(lat, mapBounds.top, mapBounds.bottom, 0, img.height);
        let d = dist(mouseX - width / 2, mouseY - height / 2, x + posX - width / 2, y + posY - height / 2);
        if(d < 10){
            clickedArray[i] = !clickedArray[i];
        }
    }
} 

//change the color of the flames with random ones 
function keyPressed(){
    if(key == "d"){
        is3DMode = !is3DMode; 
    }
}

//https://editor.p5js.org/mimimimimi/sketches/SOkckqY_r for image zoom using snippets 40 to 60
function mouseWheel(){
    /*if(is3DMode == true){
        let scroll = -event.delta; 
        //zooming in 
        if(scroll > 0){
            for(let i = 0; i < scroll; i++){
                //maximums
                if(scroll > 30 * width){
                    return 
                }
                image_x -= zoom * (mouseX - image_x);
                image_y -= zoom * (mouseY - image_y);
                image_width *= zoom + 1;
                image_height *= zoom + 1;
            }
        }
        if(scroll < 0){
            for(let i = 0; i < scroll; i++){
                if(scroll <  width){
                    return 
                }
                image_x += zoom/(zoom + 1) * (mouseX - image_x);
                image_y += zoom/(zoom + 1) * (mouseY - image_y);
                image_width /= zoom + 1;
                image_height /= zoom + 1;
            }
        }
    }*/
   
    zoomLevel -= event.delta * 0.001;
    zoomLevel = constrain(zoomLevel, 0.5, 2.0);
    return false 
}

//from Daniel Shiffman and the nature of code 
//https://natureofcode.com/particles/ 
//https://editor.p5js.org/natureofcode/sketches/Cq4knsBaA 
class Emitter{
    constructor(x, y){
        this.x = x 
        this.y = y
        this.particles = []
        //basically a dot or point to start emitting particles 
        this.vector = createVector(this.x , this.y);
    }

    run(){
        //run all of the particle objects inside of this array 
        for(let particle of this.particles){
            partX += 1
            partY += 3
            let noiseColor = getNoiseColor(partX, partY, fireArray)
            fill(noiseColor, particle.getLifespan())
            particle.run() 
        }
        this.particles = this.particles.filter((particle) => !particle.isDead()); 
    }

    addParticle(){
        let lifespan = random(20, 50)
        this.particles.push(new Particle(this.vector.x, this.vector.y, lifespan))
    }

    //https://editor.p5js.org/natureofcode/sketches/Cq4knsBaA
    // Method to add a force vector to all particles currently in the system
    applyForce(force) {
        // Enhanced loop!!!
        for (let particle of this.particles) {
            particle.applyForce(force);
        }
    }
}

class Particle{
    constructor(x, y, lifespan){
        this.position = createVector(x, y);
        //middle distribution 
        let vx = random(-0.5, 0.5);
        let vy = randomGaussian(-1.2, 0);
        this.velocity = createVector(vx, vy);
        this.acceleration = createVector(0, 0);
        this.lifespan = lifespan;
        this.dead = false 
    }

    run() {
        this.update();
        this.show();
    }

    update(){
        this.velocity.add(this.acceleration)
        this.position.add(this.velocity)
        this.lifespan -= 2.0
        this.acceleration.mult(0)
    }

    show(){
        //alpha and disappear over time
        noStroke();
        let x = floor(random(0, 2))
        //let x = 0
        //from gpt asking about how to make the particles stay still 
        let displayX = this.position.x + posX - width / 2;
        let displayY = this.position.y + posY - height / 2;
        if(x == 0){
            ellipse(displayX , displayY - 5, 20, 20)
        }
        else if(x == 1){
            rect(displayX  - 5, displayY - 15, 5, 5)
        }
    }

    isDead(){
        if(this.lifespan < 0.0){
            this.dead = true 
        }
        return this.dead 
    }

    getLifespan(){
        return this.lifespan
    }

    applyForce(force) {
        this.acceleration.add(force);
    }
}

//from Wes Modes CMPM 147
function getNoiseColor(x, y, colorArray) {
    // Generate a noise value based on x and y
    let noiseValue = noise(x * 0.8, y * 10);
  
    // Map the noise value to an index in the color array
    let index = floor(map(noiseValue, 0, 1, 0, colorArray.length));
  
    // Retrieve and return the selected color from the array
    return colorArray[index];
  }  
