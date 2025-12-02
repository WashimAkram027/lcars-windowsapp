/*****************************************************************************
The MIT License (MIT)

Copyright (c) 2014 Andi Smithers

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*****************************************************************************/

// Adapted for LCARS Overlay home page background
// Original by Andi Smithers

// globals
var canvas, context;
var cX, cY, tX, tY, mouseX, mouseY, density;
var stars = [];
var cameraDepth = 0;
var enterWarp, warpStartDepth, warpTime, velocity;

// define to 0 to brute force move all stars
const cameraTrick = 1;

// options - adapted for background use
const starCount = 512;  // Reduced from 1024 for performance
var initVelocity = -1.0;
var termVelocity = -10.0;
const topleft = 0;
const trackMouse = 1;  // Enable mouse tracking
const focalPoint = 256;
const sparcity = 1.0;
const tailLength = 20;

// depth modulo function
function modulo(a) {
  const b = 1024;
  return a - b * Math.floor(a / b);
}

// handles negative numbers correctly
function modulo2(a, b) {
  return a - b * Math.floor(a / b);
}

function Star(index) {
  // randomize a field -1024 to 1024 and positive z
  this.x = (Math.random() * 2048 - 1024) * sparcity;
  this.y = (Math.random() * 2048 - 1024) * sparcity;
  this.z = ((starCount - 1) - index) / density;

  if (topleft == 1) {
    this.x = this.x + 1024;
    this.y = this.y + 1024;
  }
}

Star.prototype.move = function() {
  this.z = modulo(this.z + velocity);
};

Star.prototype.draw = function() {
  // compute depth perspective effect
  var depth = focalPoint / (modulo(this.z + cameraDepth) + 1);
  var x = this.x * depth + cX;
  var y = this.y * depth + cY;
  var sz = 5 * depth;

  // fill a rect
  context.beginPath();
  context.rect(x, y, sz, sz);
  context.fillStyle = 'white';
  context.fill();
  context.lineWidth = 0;
  context.strokeStyle = 'black';
  context.stroke();
};

Star.prototype.warpline = function() {
  var depth = modulo(this.z + cameraDepth) + 1;
  var depthStart = modulo(this.z + warpStartDepth) + 1;
  if (depth > depthStart && termVelocity < 0) depth = 1;
  if (depth < depthStart && termVelocity > 0) depthStart = 1;

  var invDepth = focalPoint / depth;
  var invDepthStart = focalPoint / depthStart;

  var x = this.x * invDepth + cX;
  var y = this.y * invDepth + cY;
  var sz = 5 * invDepth;

  var wx = this.x * invDepthStart + cX;
  var wy = this.y * invDepthStart + cY;

  // computed quadrant dictates what 2 edges we see in rendering the trail
  var top = this.y < 0 ? sz : 0;
  var left = this.x < 0 ? sz : 0;
  var alpha = (sz / 5.0 + 0.1) * 0.7;

  // fill a ray
  context.beginPath();
  context.moveTo(wx, wy);
  context.lineTo(x + sz, y + top);
  context.lineTo(x, y + top);
  context.moveTo(wx, wy);
  context.lineTo(x + left, y + sz);
  context.lineTo(x + left, y);
  context.closePath();
  context.fillStyle = termVelocity < 0 ? 'rgba(64,128,192,' + alpha + ')' : 'rgba(192,64,32,' + alpha + ')';
  context.fill();
};

function initStars() {
  // setup canvas and context
  canvas = document.getElementById('starfield');
  if (!canvas) {
    console.error('Stars: Canvas element #starfield not found');
    return;
  }

  console.log('Stars: Initializing starfield animation');
  context = canvas.getContext('2d');
  // set canvas to be window dimensions
  resizeStars();
  canvas.addEventListener('mousemove', starsMousemove);
  canvas.addEventListener('click', starsMouseclick);
  window.addEventListener('resize', resizeStars);

  // compute center of screen
  tX = cX = canvas.width / 2;
  tY = cY = canvas.height / 2;  // Changed to center

  if (topleft == 1) {
    cX = 0;
    cY = 0;
  }

  density = starCount / 1024;
  // allocate and init stars
  for (var i = 0; i < starCount; i++) {
    stars[i] = new Star(i);
  }

  enterWarp = false;
  velocity = initVelocity;
}

function animateStars() {
  if (!canvas) return;
  // movement update
  moveStars();
  // render update
  renderStars();
  // trigger next frame
  requestAnimationFrame(animateStars);
}

function moveStars() {
  if (enterWarp) {
    velocity *= 1.02;
    if (velocity < termVelocity && termVelocity < 0) velocity = termVelocity;
    if (velocity > termVelocity && termVelocity > 0) velocity = termVelocity;
    warpTime = warpTime + 1;
    if (warpTime > 140) enterWarp = false;
    if (warpTime > tailLength) warpStartDepth = modulo(warpStartDepth + velocity);
    // catchup time
    if (warpTime > 130) {
      warpStartDepth = modulo(warpStartDepth + (cameraDepth - warpStartDepth) * 0.3);
    }
  } else {
    // slow down
    var dv = velocity - initVelocity;
    velocity -= dv * 0.01;
  }

  if (cameraTrick == 0) {
    for (var i = 0; i < stars.length; i++) {
      stars[i].move();
    }
  } else {
    // camera movement trick
    cameraDepth = modulo(cameraDepth + velocity);
  }

  var dx = tX - cX;
  var dy = tY - cY;
  var dist = Math.sqrt(dx * dx + dy * dy);

  if (dist != 0) {
    dx /= dist;
    dy /= dist;
  }
  dist = Math.min(dist, 512.0);

  cX = cX + (dist * dx * 0.06125);
  cY = cY + (dist * dy * 0.06125);
}

function renderStars() {
  // Fill with black background
  context.fillStyle = 'black';
  context.fillRect(0, 0, canvas.width, canvas.height);

  // draw all stars
  for (var i = 0; i < stars.length; i++) {
    var index = cameraTrick == 1 ? Math.floor(modulo2((i + 1 + Math.floor(cameraDepth) * density), stars.length)) : i;
    // depending on direction of travel is order of drawing trails
    if (enterWarp && termVelocity <= 0) stars[index].warpline();
    stars[index].draw();
    if (enterWarp && termVelocity > 0) stars[index].warpline();
  }
  // Removed banner text and button for clean background
}

function starsMousemove(event) {
  var rect = canvas.getBoundingClientRect();
  mouseX = event.clientX - rect.left;
  mouseY = event.clientY - rect.top;

  if (trackMouse) {
    tX = mouseX;
    tY = mouseY;
    if (termVelocity > 0) {
      tX = canvas.width - tX;
      tY = canvas.height - tY;
    }
  }
}

function swapView() {
  // Inverse the velocities to toggle between blue (forward) and red (backward) warp
  initVelocity *= -1;
  termVelocity *= -1;
  velocity *= -1;

  // Switch warplines if currently in warp
  if (enterWarp) {
    var tmp = cameraDepth;
    cameraDepth = warpStartDepth;
    warpStartDepth = tmp;
  }

  // Change view point of travel
  cX = canvas.width - cX;
  cY = canvas.height - cY;
  if (termVelocity > 0) {
    tX = canvas.width - tX;
    tY = canvas.height - tY;
  } else {
    tX = mouseX;
    tY = mouseY;
  }
}

function starsMouseclick() {
  tX = mouseX;
  tY = mouseY;
  if (termVelocity > 0) {
    tX = canvas.width - tX;
    tY = canvas.height - tY;
  }

  if (!enterWarp) {
    enterWarp = true;
    warpStartDepth = cameraDepth;
    warpTime = 0;
    // Toggle view for next warp (alternates blue/red)
    swapView();
  }
}

function resizeStars() {
  if (!canvas) return;
  // Ensure we have valid dimensions (fallback for Electron maximize timing)
  const width = window.innerWidth || document.documentElement.clientWidth || 1200;
  const height = window.innerHeight || document.documentElement.clientHeight || 800;

  if (width > 0 && height > 0) {
    canvas.width = width;
    canvas.height = height;
    console.log('Stars: Canvas resized to', width, 'x', height);
  }
}

// Startup function with validation
function startStarfield() {
  initStars();
  if (canvas && context) {
    console.log('Stars: Starting animation loop');
    animateStars();
  } else {
    console.error('Stars: Failed to initialize - canvas or context missing');
  }
}

// Entry point - wait for DOM to be ready, with delay for Electron maximize timing
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function() {
    // Small delay to ensure window is fully rendered after Electron maximize
    setTimeout(startStarfield, 100);
  });
} else {
  // DOM already loaded, but still delay for Electron window timing
  setTimeout(startStarfield, 100);
}
