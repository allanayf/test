let dataFile;
let allPenStrokes;
let currentStroke;
let startTime;
let completeTime;
let minPosX = 1000;
let maxPosX = -1000;
let minPosY = 1000;
let maxPosY = -1000;
let exportFrameRate = 30;
let exportFrameCount = -1;
let exportSecondCount = 0;
let exportTimeCount = 0;
let slotStart;
let slotEnd;
let drawScale = 0.25;
let scaleFactor = 23.5 * drawScale;

var voiceMp3;

function preload() {
  dataFile = loadStrings("pen_2.txt");
	soundFormats('mp3', 'ogg');
  voiceMp3 = loadSound('elaine.mp3');
}

function setup() {
  createCanvas(4120 * drawScale, 2890 * drawScale);
  frameRate(exportFrameRate);
  background(255);
	/*
  noFill();
  stroke(0);
  strokeWeight(1);
  rect(0, 0, width, height);
  */
	print("data length: " + dataFile.length);
  allPenStrokes = [];
  for (let i = 0; i < dataFile.length; i++) {
    let x = 0;
    let y = 0;
    let p = 0;
    let t = 0;
    parsingMessages = split(dataFile[i], ",");
    if (parsingMessages[0] == "startTime") { // handle start time
      startTime = int(parsingMessages[1]);
      print("startTime: " + startTime);
    } else {
      x = float(parsingMessages[1]);
      y = float(parsingMessages[2]);
      p = int(parsingMessages[3]);
      t = int(parsingMessages[4]);
      minPosX = min(minPosX, x);
      maxPosX = max(maxPosX, x);
      minPosY = min(minPosY, y);
      maxPosY = max(maxPosY, y);
    }
    t = t - startTime; // offset the time, unit in milliseconds
    //print("t: " + t);
    completeTime = t;
    if (x < 200 && y < 200) { // skip those outside the paper
      if (parsingMessages[0] == "d") { // pen down
        append(allPenStrokes, new PenStroke());
        currentStroke = allPenStrokes[allPenStrokes.length - 1];
        append(currentStroke.pPoints, new PenPoint(x, y, p, t));
      } else if (parsingMessages[0] == "u") { // pen up
        // do nothing for pen up, skip the last point
      } else if (parsingMessages[0] == "m") { // continue drawing
        append(currentStroke.pPoints, new PenPoint(x, y, p, t));
      }
    }
  }
  print("boundary limits: " + minPosX + "," + minPosY + "," + maxPosX + "," + maxPosY);
  print("completeTime: " + completeTime / 1000 / 60 + " minute(s)");

  /*
  print("allPenStrokes.length: " + allPenStrokes.length);
  for (let i = 0; i < allPenStrokes.length; i++) {
    print(allPenStrokes[i].pPoints.length);
  }
  */
	
	voiceMp3.play();
}

function draw() {
  //background(255);
  exportFrameCount++;
  if (exportFrameCount >= exportFrameRate) {
    exportFrameCount = 0;
    exportSecondCount++;
  }

  let timeSegment = round(1000.0 / exportFrameRate * exportFrameCount);
  exportTimeCount = exportSecondCount * 1000 + timeSegment;

  slotStart = exportSecondCount * 1000 + round(1000.0 / exportFrameRate * exportFrameCount);
  slotEnd = exportSecondCount * 1000 + round(1000.0 / exportFrameRate * (exportFrameCount + 1));
  //print(">>> " + slotStart + " - " + slotEnd);

  for (let i = 0; i < allPenStrokes.length; i++) {
    let drawStroke = allPenStrokes[i];
    for (let j = 0; j < drawStroke.pPoints.length - 1; j++) {
      let startPoint = drawStroke.pPoints[j];
      let endPoint = drawStroke.pPoints[j + 1];
      if (endPoint.timeStamp >= slotStart) {
        if (endPoint.timeStamp < slotEnd) {
          let ax = startPoint.x * scaleFactor;
          let ay = startPoint.y * scaleFactor;
          let bx = endPoint.x * scaleFactor;
          let by = endPoint.y * scaleFactor;
          let c = map(startPoint.pressure, 0, 1024, 255, 0);
          //let e = Expo.easeIn(startPoint.pressure, 255, -255, 1024); 
          stroke(0, 0, 0, c); // black ink
          strokeWeight((255 - c) * 0.02 * drawScale);
          line(ax, ay, bx, by);
        }
      }
    }
  }
}

class PenPoint {
  constructor(x, y, p, t) {
    this.x = x;
    this.y = y;
    this.pressure = p;
    this.timeStamp = t;
  }
}

class PenStroke {
  constructor() {
    this.pPoints = [];
  }
}