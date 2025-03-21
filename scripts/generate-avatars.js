const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

const avatarSize = 128;
const colors = {
  male: ['#4A90E2', '#357ABD', '#2C6AA3', '#1E4B7A'],
  female: ['#E24A8D', '#BD3575', '#A32C5F', '#7A1E45'],
  neutral: ['#4AE2A3', '#35BD7A', '#2CA363', '#1E7A47']
};

function generateAvatar(color, index) {
  const canvas = createCanvas(avatarSize, avatarSize);
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, avatarSize, avatarSize);

  // Add some visual interest
  ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
  for (let i = 0; i < 3; i++) {
    const x = Math.random() * avatarSize;
    const y = Math.random() * avatarSize;
    const size = Math.random() * 40 + 20;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }

  return canvas.toBuffer('image/png');
}

// Create avatars directory if it doesn't exist
const avatarsDir = path.join(__dirname, '../public/avatars');
if (!fs.existsSync(avatarsDir)) {
  fs.mkdirSync(avatarsDir, { recursive: true });
}

// Generate avatars for each category
Object.entries(colors).forEach(([category, categoryColors]) => {
  categoryColors.forEach((color, index) => {
    const buffer = generateAvatar(color, index);
    fs.writeFileSync(path.join(avatarsDir, `${category}-${index + 1}.png`), buffer);
  });
});

console.log('Avatar generation complete!'); 