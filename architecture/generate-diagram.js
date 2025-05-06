const fs = require('fs');
const path = require('path');
const https = require('https');

// Ensure the output directory exists
const outputDir = path.join(__dirname, 'images');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Read the PlantUML file
const pumlFile = path.join(__dirname, 'architecture-diagram.puml');
const pumlContent = fs.readFileSync(pumlFile, 'utf8');

// Encode the PlantUML content for the URL
const encoded = Buffer.from(pumlContent).toString('base64');
const url = `https://www.plantuml.com/plantuml/png/${encoded}`;

// Output file path
const outputFile = path.join(outputDir, 'architecture-diagram.png');

console.log('Generating architecture diagram...');

// Download the image
https.get(url, (response) => {
  if (response.statusCode !== 200) {
    console.error('Error generating diagram:', response.statusCode);
    return;
  }

  const file = fs.createWriteStream(outputFile);
  response.pipe(file);

  file.on('finish', () => {
    file.close();
    console.log('Diagram generated successfully!');
    console.log(`Output file: ${outputFile}`);
  });
}).on('error', (err) => {
  console.error('Error downloading diagram:', err);
}); 