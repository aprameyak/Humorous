const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');

function drawIcon(ctx, size) {
  // Background (flat vertical gradient, no transparency)
  const grad = ctx.createLinearGradient(0, 0, 0, size);
  grad.addColorStop(0, '#FFB74D'); // warm orange
  grad.addColorStop(1, '#FF8A65'); // coral
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  // Center and scale
  const cx = size / 2;
  const cy = size / 2;
  const unit = size / 12; // design unit

  // Lightbulb glass (rounded bulb)
  ctx.save();
  ctx.translate(cx, cy - unit * 0.5);
  ctx.beginPath();
  // Bulb top circle-ish + taper
  const bulbW = unit * 5.2;
  const bulbH = unit * 6.0;
  ctx.moveTo(0, -bulbH * 0.9);
  ctx.bezierCurveTo(bulbW, -bulbH * 0.9, bulbW, bulbH * 0.2, 0, bulbH * 0.2);
  ctx.bezierCurveTo(-bulbW, bulbH * 0.2, -bulbW, -bulbH * 0.9, 0, -bulbH * 0.9);
  ctx.closePath();
  ctx.fillStyle = '#FFF3E0';
  ctx.strokeStyle = '#FFE0B2';
  ctx.lineWidth = Math.max(2, size * 0.006);
  ctx.fill();
  ctx.stroke();

  // Filament (simple smile-like curve inside)
  ctx.beginPath();
  ctx.moveTo(-unit * 2.1, -unit * 0.6);
  ctx.quadraticCurveTo(0, unit * 0.4, unit * 2.1, -unit * 0.6);
  ctx.strokeStyle = '#FF7043';
  ctx.lineWidth = Math.max(3, size * 0.008);
  ctx.lineCap = 'round';
  ctx.stroke();

  // Friendly face (eyes + smile)
  // Eyes
  ctx.fillStyle = '#FF7043';
  const eyeR = Math.max(3, size * 0.01);
  ctx.beginPath();
  ctx.arc(-unit * 1.2, -unit * 1.4, eyeR, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(unit * 1.2, -unit * 1.4, eyeR, 0, Math.PI * 2);
  ctx.fill();
  // Smile
  ctx.beginPath();
  ctx.moveTo(-unit * 1.8, -unit * 0.3);
  ctx.quadraticCurveTo(0, unit * 0.8, unit * 1.8, -unit * 0.3);
  ctx.strokeStyle = '#FF7043';
  ctx.lineWidth = Math.max(4, size * 0.012);
  ctx.lineCap = 'round';
  ctx.stroke();

  // Bulb neck/base (simple bands)
  const baseTop = bulbH * 0.25;
  ctx.translate(0, baseTop);
  const baseW = unit * 3.6;
  const baseH = unit * 2.2;
  ctx.fillStyle = '#FBE9E7';
  ctx.strokeStyle = '#FFCCBC';
  ctx.lineWidth = Math.max(2, size * 0.006);
  // Main base
  ctx.beginPath();
  ctx.roundRect(-baseW, -unit * 0.4, baseW * 2, baseH, unit * 0.4);
  ctx.fill();
  ctx.stroke();
  // Ridges
  ctx.strokeStyle = '#FFB39D';
  ctx.lineWidth = Math.max(2, size * 0.006);
  const ridges = 3;
  for (let i = 0; i < ridges; i++) {
    const y = -unit * 0.1 + (i * baseH) / ridges;
    ctx.beginPath();
    ctx.moveTo(-baseW * 0.9, y);
    ctx.lineTo(baseW * 0.9, y);
    ctx.stroke();
  }

  ctx.restore();

  // Subtle highlight
  ctx.save();
  ctx.globalAlpha = 0.08;
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.ellipse(cx - unit, cy - unit * 3.2, unit * 2.6, unit * 4.2, -0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function writePng(name, size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  drawIcon(ctx, size);
  const outPath = path.join(__dirname, '..', 'assets', name);
  fs.writeFileSync(outPath, canvas.toBuffer('image/png'));
  console.log(`Wrote ${name} (${size}x${size})`);
}

function main() {
  writePng('icon.png', 1024); // App Store icon
  writePng('adaptive-icon.png', 512); // Android adaptive foreground
  writePng('splash-icon.png', 256); // Splash image
  writePng('favicon.png', 128); // Web favicon
}

main();
