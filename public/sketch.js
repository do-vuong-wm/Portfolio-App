window.rrt = ( p ) => {

let graph;
let map;
let startPoint;
let goalPoint;
const goalRadius = 40;
const numOfVertices = 2000;
let verticesCount;
const incrementDistance = 15;
// settings
let button;
let sel;

function init(obstacleType){
  // reset counter
  verticesCount = 0;

  // paint canvas
  p.background('white')
  p.stroke('black')
  p.strokeWeight(30)
  p.fill('white')
  p.rect(0, 0, 800, 800)

  // Initial map
  map = new p5.TypedDict()
  map.remove(undefined)
  
  // obstacles
  if(obstacleType === "narrow"){
    const point1 = p.createVector(Math.floor(p.width*(1/3)), Math.floor(p.height/2)+200)
    const point2 = p.createVector(Math.floor(p.width*(1/3)), 0)
    const point3 = p.createVector(Math.floor(p.width/2), p.height)
    const point4 = p.createVector(Math.floor(p.width/2), Math.floor(p.height/2) + 40)
    const point5 = p.createVector(Math.floor(p.width*(2/3)), Math.floor(p.height/2)+200)
    const point6 = p.createVector(Math.floor(p.width*(2/3)), 0)
    map.set("wall1", [point1, point2])
    map.set("wall2", [point3, point4])
    map.set("wall3", [point5, point6])
    p.strokeWeight(1)
    p.line(point1.x, point1.y, point2.x, point2.y)
    p.line(point3.x, point3.y, point4.x, point4.y)
    p.line(point5.x, point5.y, point6.x, point6.y)
  }

  // goal point
  goalPoint = randomPoint()
  p.stroke('green')
  p.strokeWeight(goalRadius)
  p.point(goalPoint.x, goalPoint.y)

  // start point
  startPoint= p.createVector(Math.floor(p.width/2), Math.floor(p.height/2))
  p.stroke('red')
  p.strokeWeight(15)
  p.point(startPoint.x, startPoint.y)

  // init graph
  graph = new p5.TypedDict()
  graph.remove(undefined)

  // graph add start
  graph.set(vectorToString(startPoint), [])
  p.stroke('blue')
  p.strokeWeight(0)

  p.noLoop();
}

p.setup = function() {
  // Container div
  let container = p.createDiv();
  container.addClass("rrt-container");

  // Settings div
  let settings = p.createDiv();
  settings.addClass("settings-container");

  // run button
  button = p.createButton("Run", "Run");
  button.addClass("toggle-button");
  button.mousePressed(toggleLoop);

  // Settings div
  let obstacleDiv = p.createDiv("Choose obstacle");
  obstacleDiv.addClass("obstacle-select-container");

  // select obstacle
  sel = p.createSelect();
  sel.option('none');
  sel.option('narrow');
  sel.selected('none');
  sel.changed(mySelectEvent);

  //Canvas setup
  let canvas = p.createCanvas(800, 800)

  obstacleDiv.child(sel);

  settings.child(obstacleDiv);
  settings.child(button);

  container.child(settings);
  container.child(canvas);

  init('none');
}

p.draw = function () {
  if(button.value() !== "Run"){
    p.push()
    let [randPoint, distance, nearPoint] = randWithNearestConfig()
    // let [distance, nearPoint] = nearestPoint(randPoint)
    let newPoint = newConfig(nearPoint, randPoint, distance)
    p.point(newPoint.x, newPoint.y)
    p.strokeWeight(1)
    p.line(nearPoint.x, nearPoint.y, newPoint.x, newPoint.y)
    addToGraph(nearPoint, newPoint)
    checkGoal(newPoint)
    verticesCount++
    if(verticesCount === numOfVertices){
      p.noLoop() 
    }
    p.pop()
  }
}

function mySelectEvent(){
  let item = sel.value();
  if(button.value() === "Reset"){
    button.value("Run");
    button.html("Run");
  }
  init(item);
  return false;
}

function toggleLoop(){
    if(button.value() === "Run"){
      p.loop();
      button.value("Reset");
      button.html("Reset");
    }
    else{
      init(sel.value());
      button.value("Run");
      button.html("Run");
    }
    // prevent default
    return false;
}

function checkGoal(newPoint){
  if(newPoint.dist(goalPoint) <= goalRadius/2){
    const path = [newPoint]
    let currentPoint = newPoint
    let found = false
    while(vectorToString(currentPoint) !== vectorToString(startPoint)){
      for(const [key, value] of Object.entries(graph.data)){
        for(let i = 0; i < value.length; i++){
          if(vectorToString(value[i]) === vectorToString(currentPoint)){
            found = true
            currentPoint = stringToVector(key)
            break
          }
        }

        if(found){
          found = !found
          path.push(currentPoint)
          break
        }
      }
    }

    for(let i = 0; i < (path.length-1); i++){
      p.stroke('red')
      p.strokeWeight(3)
      p.line(path[i].x, path[i].y, path[i+1].x, path[i+1].y)
    }
    p.noLoop()
  }
}

function randWithNearestConfig(){
  let randPoint = randomPoint();
  let [distance, nearPoint] = nearestPoint(randPoint);
  while(true){
    let inObs = false;
    for(const [key, value] of Object.entries(map.data)){
      if(doIntersect(randPoint, nearPoint, value[0], value[1])){
        inObs = true;
        break;
      }
    }

    if(!inObs)
      break;
    randPoint = randomPoint();
    [distance, nearPoint] = nearestPoint(randPoint);
  }
  return [randPoint, distance, nearPoint];
}

// // point is within a line check with 0.01 margin for error
// if(!(Math.abs(
//     value[0].dist(randPoint) + value[1].dist(randPoint) - value[0].dist(value[1]) 
//     < 0.01))){
//   inObs = true
//   break
// }

function newConfig(nearPoint, randPoint, distance){
  if (distance > incrementDistance){
    let pointNorm = p5.Vector.sub(randPoint, nearPoint)
    pointNorm.normalize()
    pointNorm.mult(incrementDistance)
    pointNorm.x = Math.floor(pointNorm.x)
    pointNorm.y = Math.floor(pointNorm.y)
    let newPoint = p5.Vector.add(nearPoint, pointNorm)
    return newPoint
  }else{
    return randPoint;
  }
}

function addToGraph(nearPoint, newPoint){
  const nearPointStr = vectorToString(nearPoint)
  const newPointStr = vectorToString(newPoint)
  graph.get(nearPointStr).push(newPoint)
  if(!graph.hasKey(newPointStr)){
    graph.set(newPointStr, [])
  }
  // if(graph.hasKey(newPointStr)){
  //   graph.get(newPointStr).push(nearPoint)
  // }else{
  //   graph.set(newPointStr, [nearPoint])
  // }
}

function nearestPoint(randomPoint){
  // guarantee to have one point in graph from init point
  const pointStrings = getKeys()
  const distances = pointStrings.map(pointString => {
    let point = stringToVector(pointString)
    return [randomPoint.dist(point), point]
  })
  return distances.sort((a, b) => {
    return a[0] - b[0]
  })[0]
}

function stringToVector(str){
  const points = str.split(',', 2)
  return p.createVector(parseInt(points[0]), parseInt(points[1]))
}

function vectorToString(vector){
  return `${vector.x},${vector.y}`
}

function randomPoint(){
  const pointX = Math.floor(Math.random()*(p.width-15*2)+15)
  const pointY = Math.floor(Math.random()*(p.height-15*2)+15)
  return p.createVector(pointX, pointY)
}

function getKeys(){
  return Object.keys(graph.data)
}


// Given three collinear points p, q, r, the function checks if
// point q lies on line segment 'pr'
function onSegment(p, q, r)
{
    if (q.x <= Math.max(p.x, r.x) && q.x >= Math.min(p.x, r.x) &&
        q.y <= Math.max(p.y, r.y) && q.y >= Math.min(p.y, r.y))
    return true;
    
    return false;
}

// To find orientation of ordered triplet (p, q, r).
// The function returns following values
// 0 --> p, q and r are collinear
// 1 --> Clockwise
// 2 --> Counterclockwise
function orientationOfPoints(p, q, r)
{
  
    // See https://www.geeksforgeeks.org/orientation-3-ordered-points/
    // for details of below formula.
    let val = (q.y - p.y) * (r.x - q.x) -
            (q.x - p.x) * (r.y - q.y);
    
    if (val == 0) return 0; // collinear
    
    return (val > 0)? 1: 2; // clock or counterclock wise
}
  
// The main function that returns true if line segment 'p1q1'
// and 'p2q2' intersect.
function doIntersect(p1, q1, p2, q2)
{
  
    // Find the four orientations needed for general and
    // special cases
    let o1 = orientationOfPoints(p1, q1, p2);
    let o2 = orientationOfPoints(p1, q1, q2);
    let o3 = orientationOfPoints(p2, q2, p1);
    let o4 = orientationOfPoints(p2, q2, q1);
    
    // General case
    if (o1 != o2 && o3 != o4)
        return true;
    
    // Special Cases
    // p1, q1 and p2 are collinear and p2 lies on segment p1q1
    if (o1 == 0 && onSegment(p1, p2, q1)) return true;
    
    // p1, q1 and q2 are collinear and q2 lies on segment p1q1
    if (o2 == 0 && onSegment(p1, q2, q1)) return true;
    
    // p2, q2 and p1 are collinear and p1 lies on segment p2q2
    if (o3 == 0 && onSegment(p2, p1, q2)) return true;
    
    // p2, q2 and q1 are collinear and q1 lies on segment p2q2
    if (o4 == 0 && onSegment(p2, q1, q2)) return true;
    
    return false; // Doesn't fall in any of the above cases
}

}

window.myp5 = new p5(rrt, "myContainer");
