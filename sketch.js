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

const fireArray = [[217, 96, 0], [230, 106, 0], [242, 117, 0], [255, 127, 0], [255, 137, 22], [255, 148, 36], [255, 159, 49]]

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
}


function setup() {
    createCanvas(2000, 2000, WEBGL);
    img.resize(img.width * 2, img.height * 2);
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
        }
    }
    for(let i = 0; i < 50; i++){
        emitterArray.push(new Emitter(0, 0))
    }
}

function draw() {
    background(240);
    //fill(0, 255, 0)
    //for webgl, https://stackoverflow.com/questions/26110959/p5-js-loadfont-function
    textSize(10)
    textFont(newFont);
    //https://natureofcode.com/particles/ 
    blendMode(ADD);
    clear();
    //https://itp-xstory.github.io/p5js-shaders/#/./docs/examples/shaders_to_shapes 
    fireTexture.shader(fireShader);
    fireShader.setUniform("iResolution", [fireTexture.width, fireTexture.height]);
    fireShader.setUniform('iTime', millis() / 5000.0);
    fireShader.setUniform("iFrame", frameCount);
    fireShader.setUniform("iMouse", [mouseX, map(mouseY, 0, height, height, 0)]);
    fireTexture.ellipse(0, 0, fireTexture.width, fireTexture.height);    

    let image_x = posX - width / 2;
    let image_y = posY - height / 2;
    
    image(img, image_x, image_y);
    
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
    drawLocations();
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
                emitterArray[i].vector.set(x + posX - width / 2, y + posY - height / 2)
                emitterArray[i].run()
                for(let j = 0; j < 2; j++){
                    emitterArray[i].addParticle()
                } 

                //apply the texture 
                texture(fireTexture)
                ellipse(x + posX - width / 2, y + posY - height / 2, 400, 400);

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
        let x = map(lon, mapBounds.left, mapBounds.right, 0, img.width);
        let y = map(lat, mapBounds.top, mapBounds.bottom, 0, img.height);
        if(dist(mouseX, mouseY, x, y) < 20){
            fill(0)
            stroke(0)
            text(comboString, x + 50, y, 10, 10)
            console.log('clicking')
        }
    }
} 

//change the color of the flames with random ones 
function keyPressed(){
    if(key == "c"){
        return 
    }
    //turn off the particles to look at just the shader
    if(key == "p"){
        return 
    }
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
        this.particles.push(new Particle(this.vector.x, this.vector.y))
    }
}

class Particle{
    constructor(x, y){
        this.position = createVector(x, y);
        //middle distribution 
        let vx = random(-0.5, 0.5);
        let vy = randomGaussian(-1.2, 0);
        this.velocity = createVector(vx, vy);
        this.acceleration = createVector(0, 0);
        this.lifespan = 40.0;
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
        if(x == 0){
            ellipse(this.position.x, this.position.y - 5, 20, 20)
        }
        else if(x == 1){
            rect(this.position.x - 5, this.position.y - 15, 5, 5)
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